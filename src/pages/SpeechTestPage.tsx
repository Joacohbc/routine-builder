import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/ui/Layout';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis';
import { cn } from '@/lib/utils';

export default function SpeechTestPage() {
	const { t, i18n } = useTranslation();
	const navigate = useNavigate();

	const [textToSpeak, setTextToSpeak] = useState('');
	const [recognitionLang, setRecognitionLang] = useState(i18n.language);

	// Use custom hooks
	const {
		isListening,
		transcript,
		error,
		toggleListening,
		isSupported: isRecognitionSupported,
		recognitionLanguages
	} = useSpeechRecognition(recognitionLang);

	const {
		isSpeaking,
		voices,
		selectedVoice,
		setSelectedVoice,
		speak
	} = useSpeechSynthesis();

	// Helper to get 					error message from code
	const getErrorMessage = (errorCode: string | null) => {
		if (!errorCode) return null;
		if (errorCode === 'network') return t('speechTest.errors.network');
		if (errorCode === 'not-allowed') return t('speechTest.errors.notAllowed');
		if (errorCode === 'no-speech') return t('speechTest.errors.noSpeech');
		return t('speechTest.errors.default');
	};

	const errorMessage = getErrorMessage(error);
	const isSupported = isRecognitionSupported;

	if (!isSupported) {
		return (
			<Layout
				header={
					<div className="flex items-center p-4 pb-2 justify-between border-b border-border">
						<button
							onClick={() => navigate(-1)}
							className="text-text-main flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-surface-highlight transition-colors"
						>
							<Icon name="arrow_back" size={24} />
						</button>
						<h2 className="text-text-main text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center pr-10">
							{t('speechTest.title')}
						</h2>
					</div>
				}
			>
				<div className="p-8 text-center text-text-secondary">
					<Icon name="error" size={48} className="mx-auto mb-4 text-red-400" />
					<p>{t('speechTest.notSupported')}</p>
				</div>
			</Layout>
		);
	}

	return (
		<Layout
			header={
				<div className="flex items-center p-4 pb-2 justify-between border-b border-border">
					<button
						onClick={() => navigate(-1)}
						className="text-text-main flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-surface-highlight transition-colors"
					>
						<Icon name="arrow_back" size={24} />
					</button>
					<h2 className="text-text-main text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center pr-10">
						{t('speechTest.title')}
					</h2>
				</div>
			}
		>
			<div className="flex flex-col gap-8 p-4">

				{/* Speech Recognition Section */}
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
						"bg-surface rounded-xl p-4 min-h-[120px] border shadow-sm relative transition-colors",
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
						onChange={(e) => setRecognitionLang(e.target.value)}
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
						onClick={toggleListening}
						className="w-full"
						icon={isListening ? 'mic_off' : 'mic'}
					>
						{isListening ? t('speechTest.stopListening') : t('speechTest.startListening')}
					</Button>
				</section>

				{/* Text to Speech Section */}
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

						{/* Voice Selector */}
						{voices.length > 0 && (
							<Select
								options={voices.map(voice => ({
									label: `${voice.name} (${voice.lang})`,
									value: voice.name
								}))}
								value={selectedVoice ? selectedVoice.name : ''}
								onChange={(e) => {
									const voice = voices.find(v => v.name === e.target.value);
									if (voice) setSelectedVoice(voice);
								}}
							/>
						)}

						<Button
							variant="secondary"
							onClick={() => speak(textToSpeak)}
							disabled={!textToSpeak || isSpeaking}
							icon="volume_up"
						>
							{isSpeaking ? t('speechTest.speaking') : t('speechTest.speak')}
						</Button>
					</div>
				</section>

			</div>
		</Layout>
	);
}
