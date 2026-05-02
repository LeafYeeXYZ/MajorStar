import z from 'zod'

export const RawDataSchema = z.object({
  学科门类: z.string(),
  专业类: z.string(),
  专业名称: z.string(),
  专业代码: z.string(),
})

export type RawData = z.infer<typeof RawDataSchema>

export const MajorDataSchema = RawDataSchema.extend({
  简介: z.string(),
  知识结构与学习方式: z.string(),
  人格特质与能力要求: z.string(),
  就业方向与竞争门槛: z.string(),
  未来发展与常见误解: z.string(),
  人生状态与自我实现: z.string(),
  embedding: z.array(z.number()).length(1024),
})

export type MajorData = z.infer<typeof MajorDataSchema>

export const ServerDataSchema = MajorDataSchema.omit({ embedding: true })

export type ServerData = z.infer<typeof ServerDataSchema>

export const ClientDataSchema = RawDataSchema.extend({
  简介: z.string(),
  embedding: z.array(z.number()).length(2),
})

export type ClientData = z.infer<typeof ClientDataSchema>
