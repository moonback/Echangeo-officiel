import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ItemCard from '../components/ItemCard';
import type { Item } from '../types';

const mockItem: Item = {
  id: '1',
  owner_id: 'user1',
  title: 'Perceuse électrique',
  description: 'Perceuse en bon état avec accessoires',
  category: 'tools',
  condition: 'good',
  is_available: true,
  created_at: '2024-01-15T10:00:00Z',
  updated_at: '2024-01-15T10:00:00Z',
  owner: {
    id: 'user1',
    email: 'user@example.com',
    full_name: 'John Doe',
    created_at: '2024-01-01T10:00:00Z',
    updated_at: '2024-01-01T10:00:00Z',
  },
  images: [
    {
      id: 'img1',
      item_id: '1',
      url: 'https://example.com/image.jpg',
      is_primary: true,
      created_at: '2024-01-15T10:00:00Z',
    },
  ],
};

const ItemCardWrapper = ({ item }: { item: Item }) => (
  <BrowserRouter>
    <ItemCard item={item} />
  </BrowserRouter>
);

describe('ItemCard', () => {
  it('renders item title and description', () => {
    render(<ItemCardWrapper item={mockItem} />);
    
    expect(screen.getByText('Perceuse électrique')).toBeInTheDocument();
    expect(screen.getByText('Perceuse en bon état avec accessoires')).toBeInTheDocument();
  });

  it('renders owner name', () => {
    render(<ItemCardWrapper item={mockItem} />);
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('renders category label', () => {
    render(<ItemCardWrapper item={mockItem} />);
    
    expect(screen.getByText('Outils')).toBeInTheDocument();
  });

  it('renders image when available', () => {
    render(<ItemCardWrapper item={mockItem} />);
    
    const image = screen.getByAltText('Perceuse électrique');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', 'https://example.com/image.jpg');
  });

  it('renders status badge when item is not available', () => {
    const unavailableItem = { ...mockItem, is_available: false };
    render(<ItemCardWrapper item={unavailableItem} />);
    
    expect(screen.getByText('Indisponible')).toBeInTheDocument();
  });

  it('shows anonymous when owner name is not available', () => {
    const itemWithoutOwner = {
      ...mockItem,
      owner: { ...mockItem.owner!, full_name: undefined },
    };
    render(<ItemCardWrapper item={itemWithoutOwner} />);
    
    expect(screen.getByText('Anonyme')).toBeInTheDocument();
  });
});
