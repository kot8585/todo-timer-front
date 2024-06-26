import dayjs from 'dayjs';
import {create} from 'zustand';
import {getToday} from '../utils/formatDateTime';

interface SelectedDateStoreType {
  selectedDate: dayjs.Dayjs;
  setSelectedDate: (date: dayjs.Dayjs) => void;
  setToday: () => void;
}

const useSelectedDateStore = create<SelectedDateStoreType>(set => ({
  selectedDate: getToday(),
  setSelectedDate: selectedDate => set({selectedDate}),
  setToday: () => set({selectedDate: getToday()}),
}));

export default useSelectedDateStore;
