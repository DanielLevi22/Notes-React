import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { ChangeEvent, FormEvent, useState } from 'react';
import { toast } from 'sonner';


interface NewNoteCardProps { 
  onNoteCreated: (content: string) => void;
}

let  speechRecognition:SpeechRecognition| null = null
  
export function NewNoteCard({onNoteCreated}:NewNoteCardProps) {
  const [shouldSowOnBoarding, setShouldSowOnBoarding] = useState(true)
  const  [content, setContent] = useState('')
  const [isRecording, setIsRecording] = useState(false)

  function handleStartEdit() {
    setShouldSowOnBoarding(false)
  }
  function handleContentChange(event:ChangeEvent<HTMLTextAreaElement>) {
    setContent(event.target.value)
    if( event.target.value === '') {
      setShouldSowOnBoarding(true)
    }

  }
  function handleSaveNote(event: FormEvent ) {
    event.preventDefault()
    if(content === '') {
      return
    }

    onNoteCreated(content)
    setContent('')
    setShouldSowOnBoarding(true)
    toast.success('Nota criada com sucesso.');
  }
  function handleStartRecording() {

    const isSpeechRecognitionApiAvailable = 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window

    if(!isSpeechRecognitionApiAvailable) {
      alert('Infelizmente seu navegador não suporta API de gravação.')
      return
    }
    setIsRecording(true)
    setShouldSowOnBoarding(false)
    const SpeechRecognitionApi = window.SpeechRecognition || window.webkitSpeechRecognition

    speechRecognition = new SpeechRecognitionApi()
    speechRecognition.lang = 'pt-BR'
    speechRecognition.continuous = true
    speechRecognition.maxAlternatives = 1
    speechRecognition.interimResults = true

    speechRecognition.onresult = (event) => {
      const transcription = Array.from(event.results).reduce((text,result) => {
        return text.concat(result[0].transcript)
      }, '')
      setContent(transcription)
    }
    speechRecognition.onerror = (event) => {
      console.error(event.error)
    }
    speechRecognition.start()
  } 
  function handleStopRecording() {
    setIsRecording(false)
    if(speechRecognition !== null) {
      speechRecognition.stop()
    }
  } 

 
  return (
  <Dialog.Root>
    <Dialog.Trigger className='rounded-md flex flex-col bg-slate-700 p-5 gap-3 text-left outline-none hover:ring-2  hover:ring-slate-600 focus-visible:ring-2 focus-visible:ring-lime-200'>
      <span className='text-sm font-medium text-slate-200'>Adicionar nota</span>
      <p className='text-sm leading-6 text-slate-400'>Grave uma nota em áudio que será convertida para texto automaticamente.</p>
    </Dialog.Trigger>
    <Dialog.Portal>
      <Dialog.Overlay className='inset-0 fixed bg-black/50' />
      <Dialog.Content className='overflow-hidden inset-0 md:inset-auto fixed md:left-1/2 md:top-1/2 md:-translate-x-1/2 outline-none md:-translate-y-1/2  md:max-w-[640px] md:h-[60vh] w-full bg-slate-700 md:rounded-md flex flex-col'>
        <Dialog.Close className='absolute right-0 top-0 bg-slate-800 p-1.5 text-slate-400 hover:text-slate-100'>
         <X className='size-5'/>
        </Dialog.Close>
        <form className='flex-1 flex flex-col'>
          <div className='flex flex-1 flex-col gap-3 p-5'>
            <span className='text-sm font-medium text-slate-300'>Adicionar nota</span>
            {shouldSowOnBoarding ? (
              <p className='text-sm leading-6 text-slate-400'>
              Comece  <button onClick={handleStartRecording} type='button' className='font-medium text-lime-400'>Gravando uma nota</button> em áudio ou se preferir <button type='button'  className='font-medium text-lime-400 hover:underline' onClick={handleStartEdit}>utilize apenas texto.</button>
            </p>
            ): (
              <textarea 
                autoFocus
                onChange={handleContentChange}
                value={content}
                className='text-sm leading-6 text-slate-400 bg-transparent resize-none flex-1 outline-none'
              />
            )}
          </div>

          {isRecording ?(
             <button 
             type='button' 
             onClick={handleStopRecording}
             className='font-medium  w-full bg-slate-900  py-4 text-center text-sm text-slate-300 outline-none hover:text-slate-100 flex items-center justify-center gap-2'>
              <div className='size-3 rounded-full bg-red-500 animate-pulse'/>
             Gravando! (clique para interromper)
           </button>
          ):(
            <button 
             type='button' 
             onClick={handleSaveNote}
             className='font-medium  w-full bg-lime-400 py-4 text-center text-sm text-lime-950 outline-none hover:bg-lime-500'>
             Salvar nota 
           </button>
          )

          }
         
        </form>
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>
)
}