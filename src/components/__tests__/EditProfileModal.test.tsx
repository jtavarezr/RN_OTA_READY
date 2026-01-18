import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { EditProfileModal } from '../EditProfileModal';
import * as eva from '@eva-design/eva';
import { ApplicationProvider, IconRegistry } from '@ui-kitten/components';
import { EvaIconsPack } from '@ui-kitten/eva-icons';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Mocks
jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
}));

// Mock react-native-safe-area-context
jest.mock('react-native-safe-area-context', () => {
  const inset = { top: 0, right: 0, bottom: 0, left: 0 };
  return {
    SafeAreaProvider: jest.fn(({ children }) => children),
    SafeAreaConsumer: jest.fn(({ children }) => children(inset)),
    useSafeAreaInsets: jest.fn(() => inset),
    useSafeAreaFrame: jest.fn(() => ({ x: 0, y: 0, width: 390, height: 844 })),
  };
});

// IMPORTANT: Mock the Modal component because it might not render content in test env if visible prop logic is complex or platform specific
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  RN.Modal = ({ visible, children }: any) => {
    return visible ? <>{children}</> : null;
  };
  return RN;
});

// Wrapper for UI Kitten context
const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <ApplicationProvider {...eva} theme={eva.light}>
    <IconRegistry icons={EvaIconsPack} />
    {children}
  </ApplicationProvider>
);

describe('EditProfileModal', () => {
  const mockOnClose = jest.fn();
  const mockOnSubmit = jest.fn();
  const initialData = {
    fullName: 'Test User',
    email: 'test@example.com',
    skills: ['React', 'Node'],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly when visible', async () => {
    const { getByText, debug } = render(
      <Wrapper>
        <EditProfileModal 
          visible={true} 
          onClose={mockOnClose} 
          onSubmit={mockOnSubmit} 
          initialData={initialData}
          loading={false}
        />
      </Wrapper>
    );

    // debug(); // Uncomment if still failing to see tree

    await waitFor(() => {
        expect(getByText('editProfessionalProfile')).toBeTruthy();
        expect(getByText('contactInformation')).toBeTruthy();
    });
  });

  it('calls onClose when cancel button is pressed', async () => {
    const { getByText } = render(
      <Wrapper>
        <EditProfileModal 
          visible={true} 
          onClose={mockOnClose} 
          onSubmit={mockOnSubmit} 
          initialData={initialData} 
          loading={false}
        />
      </Wrapper>
    );

    await waitFor(() => {
        fireEvent.press(getByText('cancel'));
    });
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('submits form data when save button is pressed', async () => {
    const { getByText } = render(
      <Wrapper>
        <EditProfileModal 
          visible={true} 
          onClose={mockOnClose} 
          onSubmit={mockOnSubmit} 
          initialData={initialData} 
          loading={false}
        />
      </Wrapper>
    );

    await act(async () => {
      fireEvent.press(getByText('saveProfile'));
    });

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalled();
      expect(mockOnSubmit).toHaveBeenCalledWith(expect.objectContaining({
        fullName: 'Test User',
        email: 'test@example.com',
        skills: ['React', 'Node']
      }));
    });
  });

  it('shows loading state when loading prop is true', () => {
    const { getByText } = render(
      <Wrapper>
        <EditProfileModal 
          visible={true} 
          onClose={mockOnClose} 
          onSubmit={mockOnSubmit} 
          initialData={initialData} 
          loading={true}
        />
      </Wrapper>
    );

    expect(getByText('saving')).toBeTruthy();
  });

  it('handles array fields (Experience) addition', async () => {
    const { getByText, getAllByText, getAllByPlaceholderText } = render(
      <Wrapper>
        <EditProfileModal 
          visible={true} 
          onClose={mockOnClose} 
          onSubmit={mockOnSubmit} 
          initialData={initialData} 
          loading={false}
        />
      </Wrapper>
    );

    // Tab selection in UI Kitten might be tricky to query by text directly if they use custom rendering
    // But our Tab has title="experience" (which becomes key in mock t('experience') -> 'experience')
    // Let's try to find it. If TabView lazy loads, we might need to force render.
    
    // NOTE: UI Kitten TabView renders all tabs but only visible one is "active". 
    // However, in test env without layout, sometimes all are rendered or none.
    // Let's click the tab header first.
    
    // There might be multiple 'experience' texts (one for tab title, one for section title inside content)
    // We want the tab title. Usually it appears first in the DOM order if tabs are at top.
    const experienceTexts = getAllByText('experience');
    // Assuming the first one is the Tab Title
    fireEvent.press(experienceTexts[0]);

    // Find the Add button for Experience section
    // 'add' key translation
    const addButtons = getAllByText('add');
    fireEvent.press(addButtons[0]);

    // Check if new fields appeared (e.g., Role Title placeholder key 'roleTitle')
    // We increase timeout and use findBy which retries internally
    // UI Kitten Input uses 'placeholder' prop. We should search by placeholder.
    // 'roleTitle' is the translation key used for placeholder.
    
    await waitFor(() => {
        const inputs = getAllByPlaceholderText('roleTitle');
        expect(inputs.length).toBeGreaterThan(0);
    }, { timeout: 5000 });
  });
});
