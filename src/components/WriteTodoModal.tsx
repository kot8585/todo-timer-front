import React, {useState} from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import {TodoType} from '../api/types';
import {Colors} from '../assets/color';
import useSelectedDateStore from '../store/selecteDateStore';
import useTodo from '../hooks/useTodos';
import {convertLocalToUtc} from '../utils/formatDateTime';
import useUserStore from '../store/userStore';

type WriteTodoModal = {
  visible: boolean;
  setShowTodoModal: React.Dispatch<React.SetStateAction<boolean>>;
  categoryIdx: number;
  categoryColor: string;
  todo?: TodoType;
};

export default function WriteTodoModal({
  visible,
  setShowTodoModal,
  categoryIdx,
  categoryColor,
  todo,
}: WriteTodoModal) {
  const selectedDate = useSelectedDateStore(state => state.selectedDate);
  const {createTodoMutation, updateTodoMutation} = useTodo(selectedDate);
  const user = useUserStore(state => state.user);
  //
  const [form, setForm] = useState({
    title: todo ? todo.title : '',
    categoryIdx: todo ? todo.categoryIdx : undefined,
  });

  const handleSubmit = () => {
    // 카테고리명은 어떻게 가져오지?
    todo
      ? updateTodoMutation.mutate({
          ...todo,
          title: form.title,
          categoryIdx: form.categoryIdx,
        })
      : createTodoMutation.mutate({
          ...form,
          userUid: user?.uid,
          startDate: convertLocalToUtc(selectedDate),
          categoryIdx: categoryIdx,
        });
    setShowTodoModal(false);
  };

  const handleChangeText = (name: string, value: string) => {
    setForm({...form, [name]: value});
  };
  return (
    <Modal visible={visible} transparent={true}>
      <Pressable
        onPress={() => {
          setShowTodoModal(false);
        }}
        style={styles.background}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.underWhiteBox}>
          <View style={styles.inputContainer}>
            <TextInput
              placeholder="할일 입력"
              value={form.title}
              onChangeText={(text: string) => handleChangeText('title', text)}
              onSubmitEditing={handleSubmit}
              autoComplete="off"
              autoFocus
              enterKeyHint="done"
              placeholderTextColor={Colors.light.bodyInActive}
              style={styles.input}
            />
          </View>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
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
    borderTopRightRadius: 8,
    borderTopLeftRadius: 8,
    alignItems: 'flex-end',
    padding: 10,
  },
  inputContainer: {
    ...Platform.select({
      ios: {marginBottom: 10},
    }),
    width: '100%',
  },
  input: {
    height: 40,
    width: '100%',
    paddingHorizontal: 10,
  },
});
