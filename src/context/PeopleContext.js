import React, { createContext, useContext, useState, useEffect } from 'react';

// Create the context
const PeopleContext = createContext();

// Create a provider component
export const PeopleProvider = ({ children }) => {
  const [connectedPeople, setConnectedPeople] = useState([]);

  // Load connected people from localStorage if available
  useEffect(() => {
    const savedPeople = localStorage.getItem('connectedPeople');
    if (savedPeople) {
      setConnectedPeople(JSON.parse(savedPeople));
    }
  }, []);

  // Save connected people to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('connectedPeople', JSON.stringify(connectedPeople));
  }, []);

  return (
    <PeopleContext.Provider value={{ connectedPeople, setConnectedPeople }}>
      {children}
    </PeopleContext.Provider>
  );
};

// Custom hook to use the PeopleContext
export const usePeopleContext = () => {
  return useContext(PeopleContext);
};
