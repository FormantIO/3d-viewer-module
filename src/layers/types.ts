import { IUniverseData } from '@formant/universe-core';
import React from 'react';
import { Positioning } from '../model/Positioning';

export interface IUniverseLayerProps {
  visible?: boolean;
  children?: React.ReactNode | React.ReactNode[];
  positioning?: Positioning;
  name?: string;
  id?: string;
}
