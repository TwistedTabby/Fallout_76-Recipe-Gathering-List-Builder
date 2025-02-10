import React, { useState, useEffect } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Container, Box } from '@mui/material';
import { Recipe, GatheringList } from '../shared/types';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#4CAF50',
    },
    secondary: {
      main: '#FFC107',
    },
  },
});

const App: React.FC = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [gatheringLists, setGatheringLists] = useState<GatheringList[]>([]);

  useEffect(() => {
    // Load saved gathering lists from localStorage
    const savedLists = localStorage.getItem('gatheringLists');
    if (savedLists) {
      setGatheringLists(JSON.parse(savedLists));
    }
  }, []);

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Container>
        <Box sx={{ my: 4 }}>
          <h1>Fallout 76 Gathering List Builder</h1>
          {/* Add your components here */}
        </Box>
      </Container>
    </ThemeProvider>
  );
};

export default App; 