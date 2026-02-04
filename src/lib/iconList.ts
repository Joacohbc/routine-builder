// A curated list of Material Symbols for the IconPicker

export const COMMON_ICONS = [
  // Inventory & Objects
  'inventory_2', 'box', 'package', 'shelves', 'backpack', 'shopping_bag',
  'category', 'checkroom', 'iron', 'diamond', 'fitness_center', 'timer',
  'scale', 'straighten', 'monitor_weight',

  // Actions & UI
  'add', 'edit', 'delete', 'save', 'search', 'settings', 'check', 'close',
  'menu', 'home', 'arrow_back', 'arrow_forward', 'more_vert', 'more_horiz',
  'visibility', 'visibility_off', 'lock', 'lock_open',

  // Status & Notifications
  'check_circle', 'error', 'warning', 'info', 'help', 'notifications',
  'calendar_today', 'schedule', 'update', 'history',

  // Health & Activity
  'directions_run', 'directions_walk', 'directions_bike', 'pool', 'rowing',
  'sports_tennis', 'sports_soccer', 'sports_basketball', 'heart_broken',
  'monitor_heart', 'water_drop', 'restaurant', 'local_fire_department'
];

export const ALL_ICONS = [
  ...COMMON_ICONS,
  // Detailed Object List
  'chair', 'table_restaurant', 'bed', 'kitchen', 'weekend', 'desk',
  'light', 'lightbulb', 'flashlight_on', 'camera', 'camera_alt',
  'laptop', 'computer', 'smartphone', 'tablet', 'mouse', 'keyboard',
  'headphones', 'speaker', 'router', 'memory', 'sd_storage', 'hard_drive',
  'videogame_asset', 'controller_gen', 'watch', 'watch_later',

  // Tools & Hardware
  'build', 'construction', 'home_repair_service', 'hammer', 'wrench',
  'handyman', 'plumbing', 'architecture', 'rule', 'square_foot',

  // Places
  'store', 'storefront', 'warehouse', 'factory', 'local_shipping',
  'local_post_office', 'local_library', 'gymnastics',

  // Food & Drink
  'lunch_dining', 'local_cafe', 'local_bar', 'local_pizza', 'bakery_dining',
  'nutrition', 'egg', 'rice_bowl', 'icecream',

  // Nature & Elements
  'forest', 'park', 'grass', 'flower', 'local_florist', 'wb_sunny',
  'bedtime', 'thunderstorm', 'ac_unit', 'waves', 'terrain',

  // Arrows & Navigation
  'arrow_upward', 'arrow_downward', 'expand_more', 'expand_less',
  'chevron_left', 'chevron_right', 'first_page', 'last_page',
  'refresh', 'sync', 'loop', 'autorenew',

  // Media
  'play_arrow', 'pause', 'stop', 'skip_next', 'skip_previous',
  'volume_up', 'volume_off', 'mic', 'mic_off', 'videocam',

  // Files & Folders
  'folder', 'folder_open', 'create_new_folder', 'topic',
  'description', 'article', 'note', 'sticky_note_2', 'receipt',
  'assignment', 'checklist', 'rule_folder', 'upload_file', 'download',

  // Finance
  'attach_money', 'payments', 'account_balance_wallet', 'credit_card',
  'receipt_long', 'shopping_cart', 'sell', 'label',

  // Communication
  'mail', 'email', 'chat', 'chat_bubble', 'forum', 'call',
  'contact_phone', 'person', 'group', 'groups',

  // Misc Symbols
  'star', 'star_border', 'favorite', 'favorite_border', 'thumb_up',
  'thumb_down', 'mood', 'mood_bad', 'face', 'bolt', 'power',
  'battery_full', 'battery_alert', 'wifi', 'signal_cellular_alt',
  'bluetooth', 'usb', 'qr_code', 'pin_drop', 'map'
];

// Deduplicate just in case
export const UNIQUE_ALL_ICONS = Array.from(new Set(ALL_ICONS));
