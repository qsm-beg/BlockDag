import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, PanResponder, Dimensions } from 'react-native';
import { colors } from '../styles/theme';

interface CustomSliderProps {
  minimumValue: number;
  maximumValue: number;
  value: number;
  onValueChange: (value: number) => void;
  step?: number;
  minimumTrackTintColor?: string;
  maximumTrackTintColor?: string;
  thumbTintColor?: string;
}

export default function CustomSlider({
  minimumValue,
  maximumValue,
  value,
  onValueChange,
  step = 0.1,
  minimumTrackTintColor = colors.accent.cyan,
  maximumTrackTintColor = colors.card.background,
  thumbTintColor = colors.accent.cyan,
}: CustomSliderProps) {
  const [sliderWidth, setSliderWidth] = useState(0);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        updateValue(evt.nativeEvent.locationX);
      },
      onPanResponderMove: (evt) => {
        updateValue(evt.nativeEvent.locationX);
      },
    })
  ).current;

  const updateValue = (locationX: number) => {
    if (sliderWidth === 0) return;

    let newValue = (locationX / sliderWidth) * (maximumValue - minimumValue) + minimumValue;
    newValue = Math.max(minimumValue, Math.min(maximumValue, newValue));

    if (step) {
      newValue = Math.round(newValue / step) * step;
    }

    onValueChange(newValue);
  };

  const percentage = ((value - minimumValue) / (maximumValue - minimumValue)) * 100;

  return (
    <View
      style={styles.container}
      onLayout={(event) => {
        setSliderWidth(event.nativeEvent.layout.width);
      }}
      {...panResponder.panHandlers}
    >
      <View style={[styles.track, { backgroundColor: maximumTrackTintColor }]}>
        <View
          style={[
            styles.minimumTrack,
            {
              backgroundColor: minimumTrackTintColor,
              width: `${percentage}%`
            }
          ]}
        />
      </View>
      <View
        style={[
          styles.thumb,
          {
            backgroundColor: thumbTintColor,
            left: `${percentage}%`
          }
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 40,
    justifyContent: 'center',
  },
  track: {
    height: 4,
    borderRadius: 2,
    backgroundColor: '#d3d3d3',
  },
  minimumTrack: {
    height: '100%',
    borderRadius: 2,
  },
  thumb: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#fff',
    marginLeft: -12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});