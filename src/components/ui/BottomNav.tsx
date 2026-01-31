import { NavLink } from 'react-router-dom';
import { Icon } from './Icon';
import { cn } from '../../lib/utils';

export function BottomNav() {
  const navItems = [
    { name: 'Cellar', icon: 'inventory_2', path: '/', disabled: false },
    { name: 'Exercises', icon: 'fitness_center', path: '/exercises', disabled: false },
    { name: 'Builder', icon: 'edit_square', path: '/builder', disabled: false }, // Changed Stats to Builder for this task scope
    { name: 'Train', icon: 'timer', path: '/train', disabled: false },
    { name: 'Settings', icon: 'settings', path: '/settings', disabled: true },
  ];

  return (
    <nav className="fixed bottom-0 w-full bg-surface-light dark:bg-surface-dark border-t border-gray-200 dark:border-surface-highlight px-6 py-4 z-30 pb-safe-bottom">
      <div className="flex justify-around items-center max-w-md mx-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) => cn(
              'flex flex-col items-center gap-1 transition-colors',
              isActive 
                ? 'text-primary' 
                : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300',
              item.disabled && 'opacity-50'
            )}
          >
            {({ isActive }) => (
              <>
                <Icon name={item.icon} filled={isActive} />
                <span className="text-[10px] font-medium">{item.name}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
