import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useExercises } from '@/hooks/useExercises';
import { useInventory } from '@/hooks/useInventory';
import { Layout } from '@/components/ui/Layout';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { TagSelector } from '@/components/ui/TagSelector';
import { cn } from '@/lib/utils';
import type { MediaItem, Exercise } from '@/types';

export default function ExerciseFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { exercises, addExercise, updateExercise } = useExercises();
  const { items: inventoryItems } = useInventory();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [muscleGroup, setMuscleGroup] = useState('');
  const [tagIds, setTagIds] = useState<number[]>([]);
  
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [selectedEquipment, setSelectedEquipment] = useState<number[]>([]);
  const [defaultType, setDefaultType] = useState<Exercise['defaultType']>('weight_reps');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (id && exercises.length > 0) {
      const ex = exercises.find(e => e.id === Number(id));
      if (ex) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setTitle(ex.title);
         
        setDescription(ex.description || '');
         
        setMuscleGroup(ex.muscleGroup);
         
        setTagIds(ex.tagIds || []);
         
        setMedia(ex.media);
         
        setSelectedEquipment(ex.primaryEquipmentIds);
         
        setDefaultType(ex.defaultType);
      }
    }
  }, [id, exercises]);

  const handleSave = async () => {
    const exerciseData: Exercise = {
      id: id ? Number(id) : undefined,
      title,
      description,
      muscleGroup, // Keep as is or derive from tags if needed
      tagIds,
      media,
      primaryEquipmentIds: selectedEquipment,
      defaultType
    };

    if (id) {
      await updateExercise(exerciseData);
    } else {
      // Remove ID for creation
      const newEx = { ...exerciseData };
      delete newEx.id;
      await addExercise(newEx);
    }
    navigate('/exercises');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');

    if (!isImage && !isVideo) {
      alert('Only images and videos are supported.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Url = event.target?.result as string;
      const newMedia: MediaItem = {
        id: crypto.randomUUID(),
        type: isImage ? 'image' : 'video',
        url: base64Url
      };
      setMedia([...media, newMedia]);
    };
    reader.readAsDataURL(file);
  };

  const addYouTube = () => {
    const url = prompt('Enter YouTube URL:');
    if (!url) return;
    
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    const videoId = (match && match[2].length === 11) ? match[2] : null;

    if (videoId) {
      setMedia([...media, {
        id: crypto.randomUUID(),
        type: 'youtube',
        url: videoId, // Store ID
        thumbnailUrl: `https://img.youtube.com/vi/${videoId}/0.jpg`
      }]);
    } else {
      alert('Invalid YouTube URL');
    }
  };

  const removeMedia = (mediaId: string) => {
    setMedia(media.filter(m => m.id !== mediaId));
  };

  const toggleEquipment = (eqId: number) => {
    if (selectedEquipment.includes(eqId)) {
      setSelectedEquipment(selectedEquipment.filter(id => id !== eqId));
    } else {
      setSelectedEquipment([...selectedEquipment, eqId]);
    }
  };

  return (
    <Layout
      header={
        <div className="flex items-center justify-between px-6 py-4 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md z-50">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-surface-highlight text-gray-900 dark:text-white transition-colors">
            <Icon name="close" />
          </button>
          <h1 className="text-lg font-bold text-gray-900 dark:text-white">{id ? 'Edit Exercise' : 'New Exercise'}</h1>
          <Button size="sm" onClick={handleSave} className="bg-primary text-white rounded-full px-6">Save</Button>
        </div>
      }
    >
      <div className="flex flex-col gap-8 mt-4">
        {/* Exercise Title */}
        <section className="flex flex-col gap-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Exercise Title</label>
            <div className="bg-surface-input dark:bg-surface-input rounded-xl p-4">
                <input 
                    type="text"
                    value={title} 
                    onChange={e => setTitle(e.target.value)} 
                    placeholder="e.g. Incline Bench Press"
                    className="w-full bg-transparent text-lg font-bold text-gray-900 dark:text-white placeholder-gray-500 outline-none"
                />
            </div>
        </section>

        {/* Description */}
        <section className="flex flex-col gap-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Description</label>
            <div className="bg-surface-input dark:bg-surface-input rounded-xl p-4">
                <textarea 
                    value={description} 
                    onChange={e => setDescription(e.target.value)} 
                    placeholder="Add cues, form tips, or setup instructions..."
                    className="w-full bg-transparent text-sm text-gray-900 dark:text-gray-300 placeholder-gray-500 outline-none resize-none min-h-25"
                />
            </div>
        </section>

        {/* Multimedia Gallery */}
        <section className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
             <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Multimedia Gallery</label>
             <button onClick={() => fileInputRef.current?.click()} className="text-primary text-xs font-bold flex items-center gap-1 hover:text-primary-dark transition-colors">
                <Icon name="add_circle" size={16} /> Add Media
             </button>
          </div>
          
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*,video/*" 
            onChange={handleFileUpload} 
          />

          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 snap-x">
             {/* Upload Button Tile */}
             <button 
                onClick={() => fileInputRef.current?.click()}
                className="flex-none w-24 h-24 rounded-2xl border-2 border-dashed border-gray-600 dark:border-gray-700 flex flex-col items-center justify-center gap-1 text-gray-500 hover:bg-white/5 transition-colors snap-start"
             >
                <Icon name="add_a_photo" size={24} />
                <span className="text-[10px] font-medium">Upload</span>
             </button>

             {/* Gallery Items */}
            {media.map(m => (
              <div key={m.id} className="relative flex-none w-24 h-24 rounded-2xl overflow-hidden bg-surface-highlight snap-start group">
                {m.type === 'image' && <img src={m.url} className="w-full h-full object-cover" />}
                {m.type === 'video' && <video src={m.url} className="w-full h-full object-cover" />}
                {m.type === 'youtube' && (
                  <>
                    <img src={m.thumbnailUrl} className="w-full h-full object-cover opacity-80" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Icon name="play_circle" className="text-white drop-shadow-lg" size={24} />
                    </div>
                  </>
                )}
                <button 
                  onClick={() => removeMedia(m.id)}
                  className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Icon name="close" size={12} />
                </button>
              </div>
            ))}
            
            {/* YouTube Button Tile */}
             <button 
                onClick={addYouTube}
                className="flex-none w-24 h-24 rounded-2xl bg-red-900/20 border border-red-900/50 flex flex-col items-center justify-center gap-1 text-red-500 hover:bg-red-900/30 transition-colors snap-start"
             >
                <Icon name="smart_display" size={24} />
                <span className="text-[10px] font-bold">YOUTUBE</span>
             </button>
          </div>
        </section>

        {/* Required Equipment */}
        <section className="flex flex-col gap-2">
           <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Required Equipment</label>
              <button onClick={() => navigate('/')} className="text-primary text-xs font-bold hover:text-primary-dark transition-colors">
                 Manage Inventory
              </button>
           </div>
           
           <div className="grid grid-cols-2 gap-3">
             {inventoryItems.map(item => {
                 const isSelected = selectedEquipment.includes(item.id!);
                 return (
                  <div 
                    key={item.id}
                    onClick={() => toggleEquipment(item.id!)}
                    className={cn(
                        "flex items-center p-3 rounded-xl border transition-all cursor-pointer relative overflow-hidden",
                        isSelected 
                            ? "bg-primary/10 border-primary shadow-[0_0_0_1px_rgba(179,157,219,1)]" 
                            : "bg-surface-input border-transparent hover:border-gray-600"
                    )}
                  >
                     <div className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center mr-3 transition-colors shrink-0",
                        isSelected ? "bg-primary text-white" : "bg-white/5 text-gray-500"
                     )}>
                        <Icon name={item.icon} />
                     </div>
                     <div className="flex-1 min-w-0">
                        <p className={cn("text-sm font-bold truncate", isSelected ? "text-primary" : "text-gray-300")}>{item.name}</p>
                        <p className="text-[10px] text-gray-500">Inventory</p>
                     </div>
                     {isSelected && (
                         <div className="absolute top-2 right-2 text-primary">
                             <Icon name="check_circle" size={16} filled />
                         </div>
                     )}
                  </div>
                 );
             })}
             
             {/* Add Item Placeholder */}
             <button onClick={() => navigate('/')} className="flex items-center justify-center gap-2 p-3 rounded-xl border border-dashed border-gray-600 hover:bg-white/5 text-gray-400 transition-colors">
                 <Icon name="add" />
                 <span className="text-sm font-medium">Add Item</span>
             </button>
           </div>
        </section>

        {/* Muscles & Tags */}
        <TagSelector
          type="exercise"
          selectedTagIds={tagIds}
          onChange={setTagIds}
        />
      </div>
    </Layout>
  );
}
