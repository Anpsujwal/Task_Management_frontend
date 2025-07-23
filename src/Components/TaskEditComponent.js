import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
   Alert,StyleSheet
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
export default function TaskEditComponent({ selectedTaskDetails, setSelectedTaskDetails ,users,groups}) {
    

    const [isEditingTask, setIsEditingTask] = useState(false);
    const [editedTaskData, setEditedTaskData] = useState(null);
    const [showDatePicker, setShowDatePicker] = useState(false);
      const [showTimePicker, setShowTimePicker] = useState(false);

    const updateTask = async () => {
        try {
            console.log('Updating task with:', editedTaskData);
            await api.put(`/api/tasks/${editedTaskData._id}`, editedTaskData);
            Alert.alert('Success', 'Task updated');
            setIsEditingTask(false);
            setSelectedTaskDetails(null);
            fetchAllTasks(); // Refresh the list
        } catch (err) {
            Alert.alert('Error', 'Failed to update task');
            console.error(err);
        }
    }


    const deleteTask = async (taskId) => {
        try {
            await api.delete(`/api/tasks/${taskId}`);
            Alert.alert('Success', 'Task deleted');
            setSelectedTaskDetails(null);
            fetchAllTasks();
        } catch (err) {
            Alert.alert('Error', 'Failed to delete task');

        }
    }

    return (

        <View style={styles.updateSection}>
            <Text style={styles.heading}>Task Details</Text>
            <Text style={styles.taskTitle}>Title: {selectedTaskDetails.title}</Text>
            <Text style={styles.taskStatus}>Comment: {selectedTaskDetails.comment || 'N/A'}</Text>
            <Text style={styles.taskStatus}>Priority: {selectedTaskDetails.priority}</Text>
            <Text style={styles.taskStatus}>
                Group: {groups.find(group => group._id === selectedTaskDetails.assignedGroup)?.name || 'None'}
            </Text>
            <Text style={styles.taskStatus}>
                Workers: {selectedTaskDetails.assignedWorkers.map((id) => { return users.find((user) => user._id === id)?.name }).join(', ') || 'None'}
            </Text>
            <Text style={styles.taskStatus}>
                Due: {new Date(selectedTaskDetails.completeBy?.dueDate).toLocaleString()}
            </Text>
            <Text style={styles.taskStatus}>
                scheduled for: {selectedTaskDetails.scheduleFor}
            </Text>
            <Text style={styles.taskStatus}>Status: {selectedTaskDetails.status?.text}</Text>

            {selectedTaskDetails.status?.updates?.length > 0 && (
                <View style={{ marginTop: 10 }}>
                    <Text style={styles.taskStatus}>Updates:</Text>
                    {selectedTaskDetails.status.updates.map((update, idx) => (
                        <View key={idx} style={{ marginBottom: 6, marginLeft: 10 }}>
                            <Text style={styles.taskStatus}>- {update.comment}</Text>
                            <Text style={styles.taskStatus}>
                                by {update.byUser?.name || 'Unknown'} on{' '}
                                {new Date(update.date).toLocaleString()}
                            </Text>
                        </View>
                    ))}
                </View>
            )}

            {!isEditingTask ? (
                <View>
                    <TouchableOpacity
                        style={[styles.submitButton, { backgroundColor: '#007bff' }]}
                        onPress={() => {
                            setIsEditingTask(true);
                            setEditedTaskData({ ...selectedTaskDetails });
                        }}
                    >
                        <Text style={styles.submitText}>Update Task</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.submitButton, { backgroundColor: '#ff0033ff' }]}
                        onPress={() => {
                            deleteTask(selectedTaskDetails._id);
                        }}
                    >
                        <Text style={styles.submitText}>Delete Task</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <>
                    <TextInput
                        style={styles.input}
                        value={editedTaskData.title}
                        onChangeText={(text) => setEditedTaskData({ ...editedTaskData, title: text })}
                        placeholder="Title"
                    />
                    <TextInput
                        style={styles.input}
                        value={editedTaskData.comment}
                        onChangeText={(text) => setEditedTaskData({ ...editedTaskData, comment: text })}
                        placeholder="comment"
                    />
                    <View style={styles.pickerWrapper}>
                        <Picker
                            selectedValue={editedTaskData.priority}
                            onValueChange={(value) => setEditedTaskData({ ...editedTaskData, priority: value })}
                            style={styles.picker}
                        >
                            <Picker.Item label="Low" value="low" />
                            <Picker.Item label="High" value="high" />
                        </Picker>
                    </View>

                    <Text>Schedule For:</Text>
                    <Picker
                        selectedValue={editedTaskData.scheduleFor}
                        style={styles.picker}
                        onValueChange={(Value) => setEditedTaskData({ ...editedTaskData, scheduleFor: Value })}>
                        <Picker.Item label="Specific Day" value="specific_day" />
                        <Picker.Item label="Weekdays" value="week_days" />
                        <Picker.Item label="Weekends" value="week_ends" />
                        <Picker.Item label="Alternate Days" value="alternate_days" />
                        <Picker.Item label="Month" value="month" />
                        <Picker.Item label="Quarter" value="quarter" />
                        <Picker.Item label="Half Yearly" value="half_yearly" />
                        <Picker.Item label="Yearly" value="yearly" />
                    </Picker>



                    <Text style={styles.label}>Update Due Date</Text>
                    <TouchableOpacity
                        onPress={() => setShowDatePicker(true)}
                        style={styles.dateText}
                    >
                        <Text>{new Date(editedTaskData?.dueDate).toLocaleString()}</Text>
                    </TouchableOpacity>

                    {showDatePicker && (
                        <DateTimePicker
                            value={new Date(editedTaskData?.dueDate)}
                            mode="date"
                            display="default"
                            onChange={(e, selectedDate) => {
                                setShowDatePicker(false);
                                if (selectedDate) {
                                    setEditedTaskData({
                                        ...editedTaskData,
                                        completeBy: {
                                            ...editedTaskData.completeBy,
                                            dueDate: selectedDate,
                                        },
                                    });
                                    setShowTimePicker(true);
                                }
                            }}
                        />
                    )}

                    {showTimePicker && (
                        <DateTimePicker
                            value={new Date(editedTaskData?.dueDate)}
                            mode="time"
                            display="default"
                            onChange={(e, selectedTime) => {
                                setShowTimePicker(false);
                                if (selectedTime) {
                                    const updatedDate = new Date(editedTaskData.completeBy?.dueDate);
                                    updatedDate.setHours(selectedTime.getHours());
                                    updatedDate.setMinutes(selectedTime.getMinutes());
                                    setEditedTaskData({
                                        ...editedTaskData,
                                        completeBy: {
                                            ...editedTaskData.completeBy,
                                            dueDate: updatedDate,
                                        },
                                    });
                                }
                            }}
                        />
                    )}

                    <TouchableOpacity
                        style={[styles.submitButton, { backgroundColor: '#28a745' }]}
                        onPress={() => {
                            updateTask();
                        }}
                    >
                        <Text style={styles.submitText}>Save Changes</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.submitButton, { backgroundColor: '#dc3545', marginTop: 10 }]}
                        onPress={() => {
                            setIsEditingTask(false);
                            setEditedTaskData(null);
                        }}
                    >
                        <Text style={styles.submitText}>Cancel</Text>
                    </TouchableOpacity>
                </>
            )}

        </View>


    )
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    padding: 20,
  },
  heading: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 25,
    color: '#333',
  },
  taskItem: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
  },
  taskTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 6,
    color: '#222',
  },
  taskStatus: {
    color: '#666',
    marginBottom: 10,
  },
  updateButton: {
    backgroundColor: '#0077cc',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  updateText: {
    color: '#fff',
    fontWeight: '600',
  },
  updateSection: {
    marginTop: 30,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 8,
    elevation: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 12,
    borderRadius: 10,
    marginBottom: 15,
    backgroundColor: '#f8f8f8',
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: '#28a745',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  submitText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },

  multiSelectWrapper: {
    marginBottom: 20,
  },

  // Additional styles for enhanced form UX
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 6,
    color: '#444',
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    marginBottom: 15,
    backgroundColor: '#f0f0f0',
  },
  picker: {
    height: 50,
    width: '100%',
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    justifyContent: 'space-between',
  },
  multiSelectOption: {
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#eee',
    marginBottom: 8,
  },
  selectedOption: {
    backgroundColor: '#cce5ff',
  },
  dateText: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    backgroundColor: '#f8f8f8',
    fontSize: 16,
    marginBottom: 15,
    color: '#333',
  },
});

