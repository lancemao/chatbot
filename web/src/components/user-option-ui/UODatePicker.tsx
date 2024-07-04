import { useContext, useState } from 'react';
import { UOTDatePickerMeta } from './type';
import UserOptionContext from '@/UserOptionContext'
import './uo.css'

const UODatePicker = ({ meta }: { meta: UOTDatePickerMeta }) => {

  const { onDatePickerClick } = useContext(UserOptionContext)
  const [dateString, setDateString] = useState(meta.text || getDate())

  function getDate(milliseconds?: number) {
    const date = milliseconds ? new Date(milliseconds) : new Date();
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return year + '-' + month + '-' + day;
  }

  const onClick = (e) => {
    onDatePickerClick?.(e, meta.text).then((res) => {
      if (res) {
        meta.text = getDate(res) + '\n'
        setDateString(meta.text)
      }
    }).catch((err) => {
      console.log(err)
    })
  }

  return (
    <div className='uo-date-picker' onClick={onClick}>
      <div className='uo-date-picker-text' >
        {dateString}
      </div>
    </div>
  )
}

export default UODatePicker;