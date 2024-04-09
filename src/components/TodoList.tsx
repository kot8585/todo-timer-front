import React from 'react';
import {ActivityIndicator, SectionList, StyleSheet, Text} from 'react-native';
import {CategoryType, TodoType} from '../api/types';
import useTodo from '../hooks/useTodos';
import useSelectedDateStore from '../store/selecteDateStore';
import Category from './Category';
import Todo from './Todo';
import Loading from './ui/Loading';
import LoadingModal from './ui/LoadingModal';

type TodoListProps = {
  categoryHandlePress?: (category: CategoryType) => void;
  todoHandlePress: (todo: TodoType) => void;
  showDotsIcon: boolean;
};

export default function TodoList({
  categoryHandlePress,
  todoHandlePress,
  showDotsIcon,
}: TodoListProps) {
  const selectedDate = useSelectedDateStore(state => state.selectedDate);

  const {
    getAllTodos: {data, isLoading, error},
  } = useTodo(selectedDate);

  if (isLoading) {
    return <ActivityIndicator size="large" style={{flex: 1}} />;
  }
  if (error) {
    return <Text>에러 발생</Text>;
  }

  if (!data) {
    return <Text>카테고리를 추가해주세요</Text>;
  }

  return (
    <SectionList
      sections={data}
      keyExtractor={index => index.idx.toString()}
      renderItem={({item}) => (
        <Todo
          todo={item}
          todoHandlePress={todoHandlePress}
          showDotsIcon={showDotsIcon}
        />
      )}
      renderSectionHeader={({section}) => (
        <Category
          category={section}
          handlePress={categoryHandlePress}
          showDotsIcon={showDotsIcon}
        />
      )}
      style={styles.container}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    gap: 15,
    width: '100%',
  },
});
