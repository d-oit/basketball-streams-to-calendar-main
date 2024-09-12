import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import ConfigurationPage from './ConfigurationPage';

test('should save API keys to localStorage when handleSave is called', () => {
  const { getByLabelText, getByText } = render(<ConfigurationPage />);

  const geminiApiKeyInput = getByLabelText('Gemini API Key');
  const googleClientIdInput = getByLabelText('Google Calendar Client ID');
  const googleApiKeyInput = getByLabelText('Google Calendar API Key');
  const googleCalendarIdInput = getByLabelText('Google Calendar Id');
  const saveButton = getByText('Save Configuration');

  fireEvent.change(geminiApiKeyInput, { target: { value: 'test-gemini-api-key' } });
  fireEvent.change(googleClientIdInput, { target: { value: 'test-google-client-id' } });
  fireEvent.change(googleApiKeyInput, { target: { value: 'test-google-api-key' } });
  fireEvent.change(googleCalendarIdInput, { target: { value: 'test-google-calendar-id' } });

  fireEvent.click(saveButton);

  expect(localStorage.getItem('REACT_APP_GEMINI_API_KEY')).toBe('test-gemini-api-key');
  expect(localStorage.getItem('REACT_APP_GOOGLE_CLIENT_ID')).toBe('test-google-client-id');
  expect(localStorage.getItem('REACT_APP_GOOGLE_API_KEY')).toBe('test-google-api-key');
  expect(localStorage.getItem('REACT_APP_GOOGLE_CALENDAR_ID')).toBe('test-google-calendar-id');
});
