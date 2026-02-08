import { useTranslation } from 'react-i18next';

interface ColorPickerProps {
	label?: string;
	value: string;
	onChange: (color: string) => void;
	colors: string[];
	error?: string;
}

export function ColorPicker({ label, value, onChange, colors, error }: ColorPickerProps) {
	const { t } = useTranslation();

	return (
		<div className="space-y-2">
			{label && (
				<label className="text-sm font-medium text-slate-700 dark:text-slate-300">
					{label}
				</label>
			)}
			<div className="flex flex-wrap gap-3">
				{colors.map((color) => (
					<button
						key={color}
						type="button"
						onClick={() => onChange(color)}
						className={`w-8 h-8 rounded-full border-2 transition-transform ${value === color
								? 'border-slate-900 dark:border-white scale-110'
								: 'border-transparent hover:scale-105'
							}`}
						style={{ backgroundColor: color }}
						aria-label={t('tags.selectColor', { color, defaultValue: `Select color ${color}` })}
					/>
				))}
			</div>
			<div
				className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden mt-2"
			>
				<div className="h-full transition-all duration-300" style={{ width: '100%', backgroundColor: value }} />
			</div>
			{error && <p className="text-sm text-red-500">{t(error)}</p>}
		</div>
	);
}
