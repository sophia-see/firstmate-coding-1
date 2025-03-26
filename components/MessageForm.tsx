"use client"

import { zodResolver } from '@hookform/resolvers/zod'
import React from 'react'
import { useForm } from 'react-hook-form'
import { z } from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { Textarea } from './ui/textarea'

const DelayUnit = ["seconds", "minutes", "hours"] as const;

const formSchema = z.object({
  delay: z.string(),
  unit: z.enum(DelayUnit),
  text: z.string().min(1, { message: "Must be at least 1 character" }),
  url: z.string().min(1, { message: "Must be at least 1 character" }),
})

export default function MessageForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      delay: "0",
      text: "",
      url: "",
      unit: "seconds"
    },
  })

  const delayTime = form.watch("delay");
  const delayUnit = form.watch("unit")

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    form.reset();
    toast("Message request sent!");
    const { url, text, delay, unit } = values;

    if (!delay || parseFloat(delay) < 0){
      toast("Invalid delay")
    } else {
      const delayNum = parseFloat(delay)

      const delayInSeconds = unit === "seconds"
          ? delayNum
          : unit === "minutes"
          ? delayNum * 60
          : delayNum * 3600;
  
          const result = await fetch("/api/schedule-message", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              webhookUrl: url,
              text,
              delay: delayInSeconds, // Optional delay in seconds
            }),
          });
  
      if (result.status != 200) {
        console.log({result})
        toast.error("Error in sending the message")
      }
    }

  }
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
      <div className='flex items-center gap-2'>
        <FormField
          control={form.control}
          name="delay"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Delay</FormLabel>
              <FormControl>
              <Input 
                {...field}
                type="number" 
              />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="unit"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Delay Unit</FormLabel>
              <FormControl>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Delay Unit" />
                  </SelectTrigger>
                  <SelectContent>
                    {DelayUnit.map((delay) => (
                      <SelectItem value={delay} key={delay}>
                        {delay}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

        <FormField
          control={form.control}
          name="text"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Message</FormLabel>
              <FormControl>
                <Textarea placeholder="Enter your message" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Hook URL</FormLabel>
              <FormControl>
                <Input placeholder="Enter your hook url" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Send {parseFloat(delayTime) == 0 ? "" : `in ${delayTime} ${delayUnit}`}</Button>
      </form>
    </Form>
  )
}
