import React from 'react';

export enum FlightStatus {
  ON_TIME = 'ON_TIME',
  DELAYED = 'DELAYED',
  CANCELLED = 'CANCELLED',
  DIVERTED = 'DIVERTED'
}

export interface Flight {
  id: string;
  flightNumber: string;
  origin: string;
  destination: string;
  departureTime: string; // ISO string
  status: FlightStatus;
  passengers: number;
  crewStatus: 'READY' | 'FATIGUED' | 'INCOMPLETE';
}

export interface CrewMember {
  id: string;
  name: string;
  role: 'CAPTAIN' | 'FIRST_OFFICER' | 'CABIN_LEAD' | 'CABIN_CREW';
  base: string;
  dutyHoursLast24h: number; // For fatigue calculation
  status: 'AVAILABLE' | 'ON_DUTY' | 'REST_REQUIRED';
}

export interface SimulationResult {
  scenario: string;
  impactAssessment: string;
  suggestedActions: string[];
  estimatedCost: number;
  recoveryTimeHours: number;
  predictedCancellationCount: number;
}

export interface OptimizerSuggestion {
  originalCrewId: string;
  replacementCrewId: string;
  reason: string;
  efficiencyGain: string;
}

export interface ShortagePrediction {
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  affectedHubs: string[];
  projectedShortageCount: number;
  summary: string;
}

export interface CommDrafts {
  sms: string;
  whatsapp: string;
  email: string;
  hindi: string;
}

export interface NavItem {
  label: string;
  path: string;
  icon: React.ComponentType<any>;
}