import React, { useState, useEffect } from 'react';
import {
    View, Text, TextInput, Button, StyleSheet, Image,
    Platform, ScrollView
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { Audio, Video } from 'expo-av';
import * as MediaLibrary from 'expo-media-library';
import api from '../api/api';

export default function StatusUpdateForm({ task, user, onClose, onSuccess, type = "task" }) {
    const [statusText, setStatusText] = useState(task.status.text);
    const [description, setDescription] = useState('');
    const [image, setImage] = useState(null);
    const [video, setVideo] = useState(null);
    const [audio, setAudio] = useState(null);
    const [recording, setRecording] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const [sound, setSound] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);


    useEffect(() => {
        (async () => {
            const cameraPerm = await ImagePicker.requestCameraPermissionsAsync();

            // Media Library (if uploading or saving files)
            const mediaPerm = await MediaLibrary.requestPermissionsAsync();

            // Audio (for recording audio or audio in video)
            const { granted: audioPerm } = await Audio.requestPermissionsAsync();

            if (!cameraPerm.granted || !mediaPerm.granted || !audioPerm) {
                alert('Camera, audio, and media permissions are required.');
            }
        })();
    }, []);

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: 'Images',
            base64: true,
            quality: 0.7
        });

        if (!result.canceled) setImage(result.assets[0]);
    };

    const takePhoto = async () => {
        let result = await ImagePicker.launchCameraAsync({
            mediaTypes: 'Images',
            base64: true,
            quality: 0.7
        });

        if (!result.canceled) setImage(result.assets[0]);
    };

    const pickVideo = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Videos,
            quality: 1
        });

        if (!result.canceled) setVideo(result.assets[0]);
    };

    const recordVideo = async () => {
        let result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Videos,
            quality: 1
        });

        if (!result.canceled) setVideo(result.assets[0]);
    };

    const pickAudio = async () => {
        const res = await DocumentPicker.getDocumentAsync({ type: 'audio/*' });
        if (res.type !== 'cancel') setAudio(res);
    };

    const startRecording = async () => {
        try {
            await Audio.setAudioModeAsync({
                allowsRecordingIOS: true,
                playsInSilentModeIOS: true,
            });

            const { recording } = await Audio.Recording.createAsync(
                Audio.RecordingOptionsPresets.HIGH_QUALITY
            );

            setRecording(recording);
        } catch (err) {
            console.error('Failed to start recording', err);
        }
    };

    const stopRecording = async () => {
        if (!recording) return;

        try {
            await recording.stopAndUnloadAsync();
            const uri = recording.getURI();
            setAudio({ uri, name: 'recorded-audio.m4a', type: 'audio/m4a' });
        } catch (error) {
            console.error("Failed to stop recording", error);
        } finally {
            setRecording(undefined);
        }
    };

    const submitUpdate = async () => {
        setSubmitting(true);

        try {
            const formData = new FormData();
            formData.append('statusText', statusText);
            formData.append('description', description);
            formData.append('byUser', user._id);

            if (Platform.OS === 'web') {

                if (image) {
                    let imgBlob;
                    const response = await fetch(image.uri);
                    imgBlob = await response.blob();
                    formData.append('image', imgBlob);
                }

                if (video) {
                    let videoBlob;
                    const response = await fetch(video.uri);
                    videoBlob = await response.blob();
                    formData.append('video', videoBlob);
                }
                if (audio) {
                    let audioBlob;
                    const response = await fetch(audio.uri);
                    audioBlob = await response.blob();
                    formData.append('audio', audioBlob);
                }
            } else {
                if (image) {
                    formData.append('image', {
                        uri: image.uri,
                        name: 'status-image.jpg',
                        type: 'image/jpeg'
                    });
                }

                if (video) {
                    formData.append('video', {
                        uri: video.uri,
                        name: 'status-video.mp4',
                        type: 'video/mp4'
                    });
                }

                if (audio) {
                    formData.append('audio', {
                        uri: audio.uri,
                        name: audio.name || 'status-audio.m4a',
                        type: audio.type || 'audio/m4a'
                    });
                }
            }
            if (type === "task") {
                await api.put(`/api/tasks/${task._id}/status`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });
            } else if (type === "ticket") {
                await api.put(`/api/tickets/${task._id}/status`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });
            }

            onSuccess();
        } catch (err) {
            console.error('Status update failed:', err);
        } finally {
            setSubmitting(false);
        }
    };

    useEffect(() => {
        return sound
            ? () => {
                sound.unloadAsync();
            }
            : undefined;
    }, [sound]);


    const toggleAudioPlayback = async () => {
        if (sound) {
            if (isPlaying) {
                await sound.pauseAsync();
                setIsPlaying(false);
            } else {
                await sound.playAsync();
                setIsPlaying(true);
            }
        } else if (audio?.uri) {
            const { sound: newSound } = await Audio.Sound.createAsync(
                { uri: audio.uri },
                { shouldPlay: true }
            );
            setSound(newSound);
            setIsPlaying(true);
        }
    };


    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.heading}>Update Task Status</Text>
            <Text>Current: {task.status.text}</Text>

            <Text>Status:</Text>
            <Picker
                selectedValue={statusText}
                onValueChange={(val) => setStatusText(val)}
                style={{ height: 50, width: 200, marginBottom: 10 }}
            >
                <Picker.Item label="Pending" value="pending" />
                <Picker.Item label="In Progress" value="in_progress" />
                <Picker.Item label="Completed" value="completed" />
            </Picker>

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

            {video && Platform.OS !== 'web' ? (
                <Video
                    source={{ uri: video.uri }}
                    style={{ width: 300, height: 200 }}
                    useNativeControls
                    resizeMode="contain"
                    isLooping
                />
            ) : (
                video && (
                    <Video
                        src={video.uri}
                        style={{ width: 300, height: 200 }}
                        controls
                    />
                )
            )}


            <View style={styles.buttons}>
                <Button title="Record Video" onPress={recordVideo} />
                <Button title="Upload Video" onPress={pickVideo} />
            </View>

            {audio && (
                <Button
                    title={isPlaying ? 'Pause Audio' : 'Play Audio'}
                    onPress={toggleAudioPlayback}
                />
            )}


            <View style={styles.buttons}>
                <Button title="Pick Audio" onPress={pickAudio} />
                {recording ? (
                    <Button title="Stop Recording" onPress={stopRecording} />
                ) : (
                    <Button title="Record Audio" onPress={startRecording} />
                )}
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
