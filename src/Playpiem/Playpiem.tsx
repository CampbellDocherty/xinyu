import { useEffect, useMemo, useState } from 'react';
import useGetLocationByIp from '../api/useGetLocation';
import useGetSunriseAndSunset from '../api/useGetSunriseAndSunset';
import { ONE_MINUTE } from './constants';
import PlaySvg from './icons/PlaySvg';
import { Time } from './schemas';
import { CityText, Container, Disclaimer, IconWrapper, Lock } from './styles';
import getCurrentTime from './timeCalculations/getCurrentTime';
import getLocalSunsetTime from './timeCalculations/getLocalSunsetTime';

const Playpiem = () => {
  const [lng, setLng] = useState<string | null>(null);
  const [lat, setLat] = useState<string | null>(null);
  const [time, setTime] = useState<Time | null>(getCurrentTime);

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(getCurrentTime);
    }, ONE_MINUTE);
    return () => clearInterval(interval);
  }, []);

  const { data, isLoading, isSuccess } = useGetLocationByIp();
  const {
    data: sunData,
    isLoading: sunDataLoading,
    isSuccess: sunDataSuccess,
  } = useGetSunriseAndSunset(lat, lng);

  useEffect(() => {
    console.log(time);
  }, [time]);

  const localSunsetTime: Time | undefined = useMemo(() => {
    if (sunData) {
      const utcSunset = sunData.results.sunset;
      const sunsetTime = getLocalSunsetTime(utcSunset);
      return sunsetTime;
    }
  }, [sunData]);

  const localSunriseTime: Time | undefined = useMemo(() => {
    if (sunData) {
      const utcSunrise = sunData.results.sunrise;
      const sunriseTime = getLocalSunsetTime(utcSunrise);
      return sunriseTime;
    }
  }, [sunData]);

  useEffect(() => {
    if (data) {
      const { loc: location } = data;
      const [userLat, userLng] = location.split(',');
      setLat(userLat);
      setLng(userLng);
    }
  }, [data]);

  const isNightTime = useMemo(() => {
    if (!time || !localSunsetTime || !localSunriseTime) {
      return false;
    }
    const isAfterSunset = time.unixTime > localSunsetTime.unixTime;
    const isBeforeSunrise = time.unixTime < localSunriseTime.unixTime;
    if (isBeforeSunrise || isAfterSunset) {
      return true;
    }
    return false;
  }, [time, localSunsetTime, localSunriseTime]);

  if (isLoading || sunDataLoading) {
    return (
      <Container>
        <p>Locating...</p>
      </Container>
    );
  }

  if (isSuccess && sunDataSuccess) {
    return (
      <Container isNightTime={isNightTime}>
        <CityText>{data.city}</CityText>
        <IconWrapper>
          <PlaySvg />
          <Lock isNightTime={isNightTime} />
        </IconWrapper>
        <p>Sunset: {localSunsetTime?.readableTime}</p>
        <Disclaimer>The location is determined by your ip address</Disclaimer>
      </Container>
    );
  }

  return null;
};

export default Playpiem;
