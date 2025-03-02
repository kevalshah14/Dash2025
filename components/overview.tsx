import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState } from 'react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';

import { MessageIcon, VercelIcon } from './icons';
import { addDocument } from '@/app/(chat)/actions';

export const Overview = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [url, setUrl] = useState('');
  const [text, setText] = useState('');

  const handleSubmit = async (type: 'url' | 'text') => {
    // Handle document submission here
    const content = type === 'url' ? url : text;
    console.log('Submitting document:', { type, content });
    await addDocument({ type, content });
    setIsOpen(false);
  };

  return (
    <motion.div
      key="overview"
      className="max-w-3xl mx-auto md:mt-20"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ delay: 0.5 }}
    >
      <div className="rounded-xl p-6 flex flex-col gap-8 leading-relaxed text-center max-w-xl">
        <p className="flex flex-row justify-center gap-4 items-center">
          <MessageIcon size={32} />
        </p>
        <p>
          This is an extremely low-hallucination, grounded chatbot designed for maximum trust and safety. 
          Unlike traditional chatbots, every response is firmly grounded in external data sources, which 
          are clearly cited and accessible. This approach ensures factual accuracy and eliminates 
          confabulation.
        </p>
        <p>
          You can add your own documents below, and the chatbot will use them as a knowledge base.
        </p>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button variant="outline">Add Documents</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Documents</DialogTitle>
            </DialogHeader>
            <Tabs defaultValue="url" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="url">URL</TabsTrigger>
                <TabsTrigger value="text">Text</TabsTrigger>
              </TabsList>
              <TabsContent value="url" className="space-y-4">
                <Input 
                  placeholder="Enter URL"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />
                <Button onClick={() => handleSubmit('url')} className="w-full">
                  Submit URL
                </Button>
              </TabsContent>
              <TabsContent value="text" className="space-y-4">
                <Textarea
                  placeholder="Enter text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  rows={5}
                />
                <Button onClick={() => handleSubmit('text')} className="w-full">
                  Submit Text
                </Button>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      </div>
    </motion.div>
  );
};
