import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/ui/Layout';
import { Icon } from '@/components/ui/Icon';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis';
import { SpeechRecognition } from '@/components/SpeechRecognition';
import { SpeechSynthesis } from '@/components/SpeechSynthesis';

export default function SpeechTestPage() {
	const { t, i18n } = useTranslation();
	const navigate = useNavigate();

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
		speak,
		isSupported: isSpeechSynthesisSupported
	} = useSpeechSynthesis();

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

				<SpeechRecognition
					isSupported={isRecognitionSupported}
					isListening={isListening}
					transcript={transcript}
					error={error}
					recognitionLanguages={recognitionLanguages}
					recognitionLang={recognitionLang}
					onToggleListening={toggleListening}
					onLanguageChange={setRecognitionLang}
				/>

				<SpeechSynthesis
					isSupported={isSpeechSynthesisSupported}
					isSpeaking={isSpeaking}
					voices={voices}
					selectedVoice={selectedVoice}
					onVoiceChange={setSelectedVoice}
					onSpeak={speak}
				/>

			</div>
		</Layout>
	);
}
