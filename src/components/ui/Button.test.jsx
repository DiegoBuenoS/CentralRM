// Button tests

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from './button';

describe('Componente Button', () => {
  it('deve renderizar o botão com texto correto', () => {
    render(<Button>Clique aqui</Button>);
    expect(screen.getByText('Clique aqui')).toBeInTheDocument();
  });

  it('deve chamar onClick quando clicado', async () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Clique</Button>);
    
    const button = screen.getByText('Clique');
    await userEvent.click(button);
    
    expect(handleClick).toHaveBeenCalledOnce();
  });

  it('deve aplicar a variante default por padrão', () => {
    render(<Button>Botão</Button>);
    const button = screen.getByText('Botão');
    
    expect(button).toHaveClass('bg-primary');
  });

  it('deve aplicar a variante secondary quando especificada', () => {
    render(<Button variant="secondary">Botão</Button>);
    const button = screen.getByText('Botão');
    
    expect(button).toHaveClass('bg-secondary');
  });

  it('deve aplicar o tamanho lg quando especificado', () => {
    render(<Button size="lg">Botão Grande</Button>);
    const button = screen.getByText('Botão Grande');
    
    expect(button).toHaveClass('h-10');
  });

  it('deve desabilitar o botão quando disabled é true', () => {
    render(<Button disabled>Desabilitado</Button>);
    const button = screen.getByRole('button');
    
    expect(button).toBeDisabled();
  });

  it('deve aplicar className customizada', () => {
    render(<Button className="custom-class">Botão</Button>);
    const button = screen.getByText('Botão');
    
    expect(button).toHaveClass('custom-class');
  });

  it('deve suportar diferentes tipos de botão', () => {
    render(<Button type="submit">Enviar</Button>);
    const button = screen.getByRole('button');
    
    expect(button).toHaveAttribute('type', 'submit');
  });
});
