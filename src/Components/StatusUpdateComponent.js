import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, Button, StyleSheet, Image,
  Platform, ScrollView, TouchableOpacity
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
      await ImagePicker.requestCameraPermissionsAsync();
      await MediaLibrary.requestPermissionsAsync();
      await Audio.requestPermissionsAsync();
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

  const recordVideo = async () => {
    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      quality: 1
    });
    if (!result.canceled) setVideo(result.assets[0]);
  };

  const startRecording = async () => {
    try {
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
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
      const { sound: newSound } = await Audio.Sound.createAsync({ uri: audio.uri }, { shouldPlay: true });
      setSound(newSound);
      setIsPlaying(true);
    }
  };

  const submitUpdate = async () => {
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('statusText', statusText);
      formData.append('description', description);
      formData.append('byUser', user._id);

      if (image) formData.append('image', { uri: image.uri, name: 'status-image.jpg', type: 'image/jpeg' });
      if (video) formData.append('video', { uri: video.uri, name: 'status-video.mp4', type: 'video/mp4' });
      if (audio) formData.append('audio', { uri: audio.uri, name: audio.name || 'status-audio.m4a', type: audio.type || 'audio/m4a' });

      const endpoint = type === "task" ? `/api/tasks/${task._id}/status` : `/api/tickets/${task._id}/status`;
      await api.put(endpoint, formData, { headers: { 'Content-Type': 'multipart/form-data' } });

      onSuccess();
    } catch (err) {
      console.error('Status update failed:', err);
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    return sound ? () => sound.unloadAsync() : undefined;
  }, [sound]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Update Task Status</Text>
      <Text style={styles.label}>Current: {task.status.text}</Text>

      <Text style={styles.label}>New Status</Text>
      <View style={styles.pickerWrapper}>
        <Picker selectedValue={statusText} onValueChange={setStatusText} style={styles.picker}>
          <Picker.Item label="Pending" value="pending" />
          <Picker.Item label="In Progress" value="in_progress" />
          <Picker.Item label="Completed" value="completed" />
        </Picker>
      </View>

      <Text style={styles.label}>Description</Text>
      <TextInput
        style={styles.input}
        placeholder="What did you do?"
        value={description}
        onChangeText={setDescription}
        multiline
      />

      {image && <Image source={{ uri: image.uri }} style={styles.imagePreview} />}

      <View style={styles.buttonRow}>
        <Button title="Take Photo" onPress={takePhoto} />
      </View>

      {video && (
        <Video
          source={{ uri: video.uri }}
          style={styles.videoPreview}
          useNativeControls
          resizeMode="contain"
          isLooping
        />
      )}

      <View style={styles.buttonRow}>
        <Button title="Record Video" onPress={recordVideo} />
      </View>

      {audio && (
        <Button title={isPlaying ? 'Pause Audio' : 'Play Audio'} onPress={toggleAudioPlayback} />
      )}

      <View style={styles.buttonRow}>
        {recording
          ? <Button title="Stop Recording" onPress={stopRecording} />
          : <Button title="Record Audio" onPress={startRecording} />
        }
      </View>

      <View style={styles.submitRow}>
        <Button title="Submit" onPress={submitUpdate} disabled={submitting} />
        <Button title="Cancel" onPress={onClose} color="#999" />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fefefe',
    padding: 20,
  },
  heading: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  label: {
    fontSize: 16,
    marginTop: 10,
    marginBottom: 5,
    color: '#555',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#fff',
    textAlignVertical: 'top',
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    backgroundColor: '#fff',
    overflow: 'hidden',
    marginBottom: 10,
  },
  picker: {
    height: 50,
    width: '100%',
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginVertical: 10,
  },
  videoPreview: {
    width: '100%',
    height: 220,
    borderRadius: 10,
    marginVertical: 10,
  },
  buttonRow: {
    marginVertical: 10,
  },
  submitRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
});
