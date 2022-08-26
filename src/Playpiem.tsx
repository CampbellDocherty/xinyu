import { useMemo, useState } from 'react';
import useGetSunriseAndSunset from './api/useGetSunriseAndSunset';
import getLocation, { LONDON_LAT, LONDON_LNG } from './getLocation';
import { Container, LocationConsentWrapper } from './styles';

const getLocalTime = (utcTime: string) => {
  const localDateTime = new Date(utcTime);
  const localTime = localDateTime.toString().split(' ')[4];
  return localTime;
};

const Playpiem = () => {
  const [isLocating, setIsLocating] = useState(false);
  const [lng, setLng] = useState<number | null>(null);
  const [lat, setLat] = useState<number | null>(null);

  const { data, isLoading } = useGetSunriseAndSunset(lat, lng);

  const onClickYes = () => {
    setIsLocating(true);
    const location = getLocation();
    setLat(location.lat);
    setLng(location.lng);
    setIsLocating(false);
  };

  const onClickNo = () => {
    setLat(LONDON_LAT);
    setLng(LONDON_LNG);
  };

  const localSunsetTime = useMemo(() => {
    if (data) {
      const utcSunset = data.results.sunset;
      const sunsetTime = getLocalTime(utcSunset);
      return sunsetTime;
    }
  }, [data]);

  return (
    <Container>
      {!data && !isLoading && (
        <LocationConsentWrapper>
          <p>
            Can we get your location? If you say no, we will just go with
            London!
          </p>
          <button onClick={onClickYes}>Yes</button>
          <button onClick={onClickNo}>No</button>
        </LocationConsentWrapper>
      )}
      {(isLocating || isLoading) && <p>Locating...</p>}
      {localSunsetTime && <p>Sunset: {localSunsetTime}</p>}
    </Container>
  );
};

export default Playpiem;
