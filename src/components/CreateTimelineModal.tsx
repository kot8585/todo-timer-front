import dayjs from 'dayjs';
import React, {useEffect, useRef, useState} from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {TodoType} from '../api/types';
import {Colors} from '../assets/color';
import useTimeline from '../hooks/useTimeline';
import useTodo from '../hooks/useTodos';
import useSelectedDateStore from '../store/selecteDateStore';
import CustomModal from './CustomModal';
import TodoList from './TodoList';
import Toast from 'react-native-toast-message';
import useUserStore from '../store/userStore';

type CreateTimelineModalProps = {
  visible: boolean;
  setModalVisible: (value: boolean) => void;
  clickedTime: number;
};

function calculateDate(date: string, hour: number, isStartDate: boolean) {
  const dateFormat = dayjs(date);
  if (hour <= 5 && !isStartDate) {
    return dateFormat.add(1, 'day');
  }

  if (isStartDate && hour < 5) {
    return dateFormat.add(1, 'day');
  }
  return dateFormat;
}

export default function CreateTimelineModal({
  visible,
  setModalVisible,
  clickedTime,
}: CreateTimelineModalProps) {
  const [showTodoListModal, setShowTodoListModal] = useState(false);
  const user = useUserStore(state => state.user);
  const selectedDate = useSelectedDateStore(state => state.selectedDate);
  const startHourRef = useRef<TextInput>();
  const startMinuteRef = useRef<TextInput>();
  const endHourRef = useRef<TextInput>();
  const endMinuteRef = useRef<TextInput>();

  const {
    getAllTodos: {data: todos},
  } = useTodo(selectedDate);

  const [form, setForm] = useState({
    todoIdx: undefined,
    todoColor: '#696969',
    todoTitle: '작성된 투두가 없어요',
    date: selectedDate,
    startHour: clickedTime.toString().padStart(2, '0'),
    startMinute: '00',

    endHour: dayjs()
      .set('hour', clickedTime)
      .add(1, 'hour')
      .get('hour')
      .toString()
      .padStart(2, '0'),
    endMinute: '00',
  });

  useEffect(() => {
    if (todos && todos?.length > 0 && todos[0].data.length > 0) {
      setForm(prevForm => ({
        ...prevForm,
        todoIdx: todos[0].data[0].idx,
        todoColor: todos[0].color,
        todoTitle: todos[0].data[0].title,
      }));
    }
  }, [todos, clickedTime]);

  const handleChangeText = (name: string, value: string) => {
    setForm({...form, [name]: value});
  };
  const {createTimelineMutation} = useTimeline(selectedDate);

  const handleSubmit = async () => {
    if (!form.todoIdx) {
      Toast.show({
        type: 'info',
        text1: '투두를 선택해주세요',
        position: 'top',
      });
      return;
    }
    if (!form.startHour) {
      startHourRef.current?.focus();
      return;
    }
    const startHour = parseInt(form.startHour, 10);
    console.log('뭐야!@@startHour', startHour);
    if (startHour > 23 || startHour < 0 || isNaN(startHour)) {
      Toast.show({
        type: 'info',
        text1: '시간은 0 ~ 23까지 설정 가능해요',
        position: 'top',
      });
      return;
    }
    const endHour = parseInt(form.endHour, 10);
    if (endHour > 23 || endHour < 0 || isNaN(endHour)) {
      Toast.show({
        type: 'info',
        text1: '시간은 0 ~ 23까지 설정 가능해요',
        position: 'top',
      });
      return;
    }

    const startMinute = parseInt(form.startMinute, 10);
    const endMinute = parseInt(form.endMinute, 10);
    if (
      startMinute > 61 ||
      startMinute < 0 ||
      isNaN(startMinute) ||
      endMinute > 61 ||
      endMinute < 0 ||
      isNaN(endMinute)
    ) {
      Toast.show({
        type: 'info',
        text1: '시간은 0 ~ 60까지 설정 가능해요',
        position: 'top',
      });
      return;
    }
    if (!form.startMinute) {
      startHourRef.current?.focus();
      return;
    }
    if (!form.endHour) {
      startHourRef.current?.focus();
      return;
    }
    if (!form.endMinute) {
      startHourRef.current?.focus();
      return;
    }
    const startDateTime = dayjs(calculateDate(selectedDate, startHour, true))
      .hour(startHour)
      .minute(parseInt(form.startMinute))
      .utc();

    const endDateTime = dayjs(calculateDate(selectedDate, endHour, false))
      .hour(endHour)
      .minute(parseInt(form.endMinute))
      .utc();

    //TODO: executionTime이 1분 이하일 경우 추가하지 않도록 하기s
    const executionTime = endDateTime.diff(startDateTime, 'second');
    console.log('executionTime', executionTime);
    if (executionTime < 60) {
      Toast.show({
        type: 'info',
        text1: '1분 이상의 시간만 저장할 수 있어요',
        position: 'top',
      });
      return;
    }

    console.log('startDateTime, endDateTime', startDateTime, endDateTime);
    const CreateTimelineRequest = {
      userUid: user.uid,
      todoIdx: form.todoIdx,
      startDateTime: startDateTime,
      endDateTime: endDateTime,
      executionTime: executionTime,
      action: 'stop',
    };

    console.log('CreateTimelineRequest', CreateTimelineRequest);
    createTimelineMutation.mutate(CreateTimelineRequest);
    setModalVisible(false);
  };

  const handleTodoPress = () => {
    console.log('버튼눌림');
    setShowTodoListModal(true);
    console.log('showTodoListModal', showTodoListModal);
  };

  const todoHandlePress = (todo: TodoType) => {
    setForm(form => ({
      ...form,
      todoIdx: todo.idx,
      todoColor: todo.color,
      todoTitle: todo.title,
    }));
    setShowTodoListModal(false);
  };

  return (
    <CustomModal
      visible={visible}
      setModalVisible={setModalVisible}
      position={'middle'}>
      <View style={styles.container}>
        <Text style={styles.headerText}>시간기록 추가</Text>
        <Pressable onPress={handleTodoPress} style={styles.todo} hitSlop={7}>
          <View style={styles.todoColor(form.todoColor)} />
          <Text style={styles.todoText}>{form.todoTitle}</Text>
          <View style={{flexGrow: 1}} />
          <Icon name="chevron-right" size={24} color={'#808080'} />
        </Pressable>
        <View style={styles.time}>
          <TextInput
            keyboardType="numeric"
            style={[styles.inputTime, styles.timeText]}
            placeholder={(clickedTime + 1).toString()}
            value={form.startHour}
            placeholderTextColor="#a4a4a4"
            onChangeText={(text: string) => {
              handleChangeText('startHour', text);
              if (text.length >= 2) {
                startMinuteRef.current?.focus();
              }
            }}
            ref={startHourRef}
            autoFocus
            onSubmitEditing={() => startMinuteRef.current?.focus()}
          />
          <Text style={styles.timeText}>:</Text>
          <TextInput
            keyboardType="numeric"
            placeholder="00"
            value={form.startMinute}
            onChangeText={(text: string) => {
              handleChangeText('startMinute', text);
              if (text.length >= 2) {
                endHourRef.current?.focus();
              }
            }}
            ref={startMinuteRef}
            onSubmitEditing={() => endHourRef.current?.focus()}
            placeholderTextColor="#a4a4a4"
            style={[styles.inputTime, styles.timeText]}
          />
          <Text style={[styles.timeText, styles.timeMid]}>ㅡ</Text>
          <TextInput
            keyboardType="numeric"
            placeholder={(clickedTime + 1).toString()}
            value={form.endHour}
            ref={endHourRef}
            onSubmitEditing={() => endMinuteRef.current?.focus()}
            onChangeText={(text: string) => {
              handleChangeText('endHour', text);
              if (text.length >= 2) {
                endMinuteRef.current?.focus();
              }
            }}
            placeholderTextColor="#a4a4a4"
            style={[styles.inputTime, styles.timeText]}
          />
          <Text style={styles.timeText}>:</Text>
          <TextInput
            keyboardType="numeric"
            placeholder="00"
            value={form.endMinute}
            ref={endMinuteRef}
            onChangeText={(text: string) => handleChangeText('endMinute', text)}
            placeholderTextColor="#a4a4a4"
            style={[styles.inputTime, styles.timeText]}
          />
        </View>
        <Pressable onPress={handleSubmit} style={styles.button}>
          <Text style={styles.buttonText}>추가</Text>
        </Pressable>
      </View>
      {showTodoListModal && (
        <CustomModal
          visible={showTodoListModal}
          setModalVisible={setShowTodoListModal}
          position={'under'}>
          <TodoList todoHandlePress={todoHandlePress} showDotsIcon={false} />
        </CustomModal>
      )}
    </CustomModal>
  );
}

const styles = StyleSheet.create({
  container: {gap: 8, width: '100%'},

  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.light.bodyDefault,
    marginBottom: 8,
  },
  todo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 4,
  },
  todoText: {
    fontSize: 16,
    flexWrap: 'wrap',
    flexShrink: 1,
    ...Platform.select({
      android: {lineHeight: 20},
    }),
  },
  todoColor: (backgroundColor: string) => ({
    backgroundColor: backgroundColor,
    width: 25,
    height: 25,
    borderRadius: 25,
    marginRight: 8,
    marginLeft: 2,
  }),
  time: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
  },
  timeText: {fontSize: 20, fontWeight: 'bold', color: Colors.light.bodyDefault},
  timeMid: {flexGrow: 1, textAlign: 'center'},

  inputTime: {
    backgroundColor: '#F1F1F1',
    borderRadius: 8,
    padding: 10,
  },

  button: {
    backgroundColor: '#808080',
    borderColor: Colors.light.borderDefault,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  buttonText: {
    fontSize: 14,
    color: '#FFFFFF',
  },
  background: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  underWhiteBox: {
    width: '100%',
    backgroundColor: Colors.light.background,
    elevation: 2,
    borderRadius: 8,
    alignItems: 'flex-end',
    padding: 12,
  },
});
