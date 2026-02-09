import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';

interface SpeechSynthesisProps {
	isSupported: boolean;
	isSpeaking: boolean;
	voices: SpeechSynthesisVoice[];
	selectedVoice: SpeechSynthesisVoice | null;
	onVoiceChange: (voice: SpeechSynthesisVoice) => void;
	onSpeak: (text: string) => void;
}

export function SpeechSynthesis({
	isSupported,
	isSpeaking,
	voices,
	selectedVoice,
	onVoiceChange,
	onSpeak
}: SpeechSynthesisProps) {
	const { t } = useTranslation();
	const [textToSpeak, setTextToSpeak] = useState('');

	if (!isSupported) {
		return (
			<section className="flex flex-col gap-4">
				<h3 className="text-primary text-sm font-bold uppercase tracking-wider">
					{t('speechTest.textToSpeech')}
				</h3>
				<div className="p-8 text-center text-text-secondary bg-surface rounded-xl border border-border">
					<Icon name="error" size={48} className="mx-auto mb-4 text-red-400" />
					<p>{t('speechTest.notSupported')}</p>
				</div>
			</section>
		);
	}

	return (
		<section className="flex flex-col gap-4">
			<h3 className="text-primary text-sm font-bold uppercase tracking-wider">
				{t('speechTest.textToSpeech')}
			</h3>

			<div className="flex flex-col gap-3">
				<Input
					value={textToSpeak}
					onChange={(e) => setTextToSpeak(e.target.value)}
					placeholder={t('speechTest.placeholder')}
				/>

				{voices.length > 0 && (
					<Select
						options={voices.map(voice => ({
							label: `${voice.name} (${voice.lang})`,
							value: voice.name
						}))}
						value={selectedVoice ? selectedVoice.name : ''}
						onChange={(e) => {
							const voice = voices.find(v => v.name === e.target.value);
							if (voice) onVoiceChange(voice);
						}}
					/>
				)}

				<Button
					variant="secondary"
					onClick={() => onSpeak(textToSpeak)}
					disabled={!textToSpeak || isSpeaking}
					icon="volume_up"
				>
					{isSpeaking ? t('speechTest.speaking') : t('speechTest.speak')}
				</Button>
			</div>
		</section>
	);
}
