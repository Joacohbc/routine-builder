import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { Select } from '@/components/ui/Select';
import { cn } from '@/lib/utils';

interface SpeechRecognitionProps {
	isSupported: boolean;
	isListening: boolean;
	transcript: string;
	error: string | null;
	recognitionLanguages: Array<{ label: string; value: string }>;
	recognitionLang: string;
	onToggleListening: () => void;
	onLanguageChange: (lang: string) => void;
}

export function SpeechRecognition({
	isSupported,
	isListening,
	transcript,
	error,
	recognitionLanguages,
	recognitionLang,
	onToggleListening,
	onLanguageChange
}: SpeechRecognitionProps) {
	const { t } = useTranslation();

	const getErrorMessage = (errorCode: string | null) => {
		if (!errorCode) return null;
		if (errorCode === 'network') return t('speechTest.errors.network');
		if (errorCode === 'not-allowed') return t('speechTest.errors.notAllowed');
		if (errorCode === 'no-speech') return t('speechTest.errors.noSpeech');
		return t('speechTest.errors.default');
	};

	const errorMessage = getErrorMessage(error);

	if (!isSupported) {
		return (
			<section className="flex flex-col gap-4">
				<h3 className="text-primary text-sm font-bold uppercase tracking-wider">
					{t('speechTest.speechToText')}
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
			<div className="flex items-center justify-between">
				<h3 className="text-primary text-sm font-bold uppercase tracking-wider">
					{t('speechTest.speechToText')}
				</h3>
				<span className={cn(
					"text-xs font-medium px-2 py-1 rounded-full",
					isListening ? 'bg-green-500/10 text-green-500' : 'bg-surface text-text-muted'
				)}>
					{isListening ? t('speechTest.listening') : t('speechTest.idle')}
				</span>
			</div>

			<div className={cn(
				"bg-surface rounded-xl p-4 min-h-30 border shadow-sm relative transition-colors",
				isListening ? "border-green-500/40" : "border-border"
			)}>
				{transcript ? (
					<p className="text-text-main leading-relaxed">{transcript}</p>
				) : (
					<p className="text-text-muted italic text-sm">
						{isListening ? t('speechTest.speakNow') : `${t('speechTest.transcript')}...`}
					</p>
				)}

				{isListening && !transcript && (
					<div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1">
						<span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
						<span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse [animation-delay:150ms]" />
						<span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse [animation-delay:300ms]" />
					</div>
				)}
			</div>

			<Select
				label={t('speechTest.recognitionLanguage')}
				options={recognitionLanguages}
				value={recognitionLang}
				onChange={(e) => onLanguageChange(e.target.value)}
				disabled={isListening}
			/>

			{errorMessage && (
				<div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 text-red-500 text-sm font-medium border border-red-500/20">
					<Icon name="error" size={20} />
					<p>{errorMessage}</p>
				</div>
			)}

			<Button
				variant={isListening ? 'secondary' : 'primary'}
				onClick={onToggleListening}
				className="w-full"
				icon={isListening ? 'mic_off' : 'mic'}
			>
				{isListening ? t('speechTest.stopListening') : t('speechTest.startListening')}
			</Button>
		</section>
	);
}
