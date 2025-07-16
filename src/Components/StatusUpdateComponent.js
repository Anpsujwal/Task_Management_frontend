import React, { useState } from 'react';
import {
    View, Text, TextInput, Button, StyleSheet, Image,
    TouchableOpacity, Platform,ScrollView
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import api from '../api/api';


export default function StatusUpdateForm({ task, user, onClose, onSuccess }) {
    const [statusText, setStatusText] = useState(task.status.text);
    const [description, setDescription] = useState('');
    const [image, setImage] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: 'Images',
            base64: true,
            quality: 0.7
        });

        if (!result.canceled) {
            setImage(result.assets[0]);
        }
    };

    const takePhoto = async () => {
        let result = await ImagePicker.launchCameraAsync({
            mediaTypes: 'Images',
            base64: true,
            quality: 0.7
        });

        if (!result.canceled) {
            setImage(result.assets[0]);
        }
    };

    const submitUpdate = async () => {
        setSubmitting(true);

        try {
            const formData = new FormData();

            formData.append('statusText', statusText);
            formData.append('description', description);
            formData.append('byUser', user._id);

            if (image) {
                let fileBlob;

                // Web needs blob conversion
                if (Platform.OS === 'web') {
                    const response = await fetch(image.uri);
                    fileBlob = await response.blob();
                }

                formData.append('image',
                    Platform.OS === 'web'
                        ? fileBlob
                        : {
                            uri: image.uri,
                            name: 'status-image.jpg',
                            type: 'image/jpeg'
                        }
                );
            }

            await api.put(`/api/tasks/${task._id}/status`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            onSuccess();
        } catch (err) {
            console.error('Status update failed:', err);
        } finally {
            setSubmitting(false);
        }
    };

    return (
         <ScrollView style={styles.container} contentContainerStyle={{ flexGrow: 1 }}>
            <Text style={styles.heading}>Update Task Status</Text>
            <Text>Current: {task.status.text}</Text>

            <Text>Status:</Text>
            <select
                value={statusText}
                onChange={(e) => setStatusText(e.target.value)}
                style={styles.dropdown}
            >
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
            </select>

            <Text>Description of update:</Text>
            <TextInput
                style={styles.input}
                placeholder="What did you do?"
                value={description}
                onChangeText={setDescription}
            />

            {image && <Image source={{ uri: image.uri }} style={styles.imagePreview} />}
            <View style={styles.buttons}>
                <Button title="Take Photo" onPress={takePhoto} />
                <Button title="Upload Image" onPress={pickImage} />
            </View>

            <View style={styles.buttons}>
                <Button title="Submit" onPress={submitUpdate} disabled={submitting} />
                <Button title="Cancel" onPress={onClose} />
            </View>
      
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { padding: 20 },
    heading: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 8,
        marginVertical: 10,
        borderRadius: 4
    },
    dropdown: {
        marginVertical: 10,
        padding: 6
    },
    imagePreview: {
        width: 200,
        height: 200,
        marginVertical: 10
    },
    buttons: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 15
    }
});
