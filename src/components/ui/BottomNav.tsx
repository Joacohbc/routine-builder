import { NavLink } from 'react-router-dom';
import { Icon, cn } from './Icon';

export function BottomNav() {
  const navItems = [
    { name: 'Cellar', icon: 'inventory_2', path: '/' },
    { name: 'Exercises', icon: 'fitness_center', path: '/exercises' },
    { name: 'Builder', icon: 'edit_square', path: '/builder' }, // Changed Stats to Builder for this task scope
    { name: 'Train', icon: 'timer', path: '/train' },
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
              // @ts-ignore
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
