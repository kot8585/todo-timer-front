import dayjs from 'dayjs';
import React, {useState} from 'react';
import {Pressable, ScrollView, StyleSheet, Text, View} from 'react-native';
import {useQuery} from 'react-query';
import {getTimelines} from '../../api/timeline';
import CreateTimelineModal from '../components/CreateTimelineModal';
import TimelineEvent from '../components/TimelineEvent';
import useUserStore from '../store/userStore';

export default function TimelineScreen() {
  const user = useUserStore(state => state.user);
  const [showModal, setShowModal] = useState(false);
  const handlePress = hour => {
    // date받아야되는데
    setShowModal(true);
  };
  // 시간표 데이터를 생성하는 함수
  const generateTimeTableData = () => {
    let timeTableData = [];
    // 오전 5시부터 다음날 오전 4시까지 총 24줄 생성
    for (let hour = 5; hour <= 28; hour++) {
      // 시간에 따른 문자열 생성
      const hourText = (hour % 24).toString().padStart(2, '0');

      // row 생성
      timeTableData.push(
        <Pressable
          key={hour}
          style={styles.row}
          onPress={() => {
            handlePress(hour);
          }}>
          {/* 컬럼 생성 */}
          <Text style={styles.hourText}>{hourText}</Text>

          {/* 10분 간격의 컬럼 생성 */}
          {[1, 2, 3, 4, 5, 6].map((_, index) => (
            <View key={index} style={styles.column} />
          ))}
        </Pressable>,
      );
    }
    return timeTableData;
  };

  const startDateTime = dayjs()
    .set('hour', 5)
    .set('minute', 0)
    .set('second', 0);
  const result = useQuery(['timelines'], () =>
    getTimelines(user?.uid, startDateTime),
  );
  const {data, error, isLoading} = result;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.timeTable}>
        {generateTimeTableData()}

        {data?.map(timelineEvent => (
          <TimelineEvent
            timelineEvent={timelineEvent}
            date="2024-03-13"
            key={timelineEvent.idx}
          />
        ))}
      </View>
      <CreateTimelineModal visible={showModal} setModalVisible={setShowModal} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
  },
  timeTable: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    borderWidth: 1,
    borderColor: 'black',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: 'black',
  },
  hourText: {
    width: '10%', // 1열은 시간을 나타내므로 너비를 조절하여 글자에 맞게 설정
    textAlign: 'center',
  },

  column: {
    width: '15%',
    height: 25,
    borderLeftWidth: 1,
    borderColor: 'black',
  },
});
