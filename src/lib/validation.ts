import { z } from "zod";
import { BUS_STATUSES } from "@/lib/types";

export const busArrivalSchema = z.object({
  bay: z.string().trim().min(1, "Bay is required").max(20),
  bus_number: z.string().trim().min(1, "Bus number is required").max(40),
  operator_name: z.string().trim().min(1, "Operator is required").max(100),
  route_from: z.string().trim().min(1, "Origin is required").max(100),
  route_to: z.string().trim().min(1, "Destination is required").max(100),
  route_via: z
    .string()
    .trim()
    .max(200)
    .optional()
    .transform((v) => (v ? v : null)),
  scheduled_arrival: z.string().min(1, "Arrival time is required"),
  scheduled_departure: z.string().min(1, "Departure time is required"),
  status: z.enum(BUS_STATUSES),
});

export type BusArrivalInput = z.infer<typeof busArrivalSchema>;

export const adUploadSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(120),
  media_type: z.enum(["image", "gif", "video"]),
  duration_seconds: z
    .number()
    .positive()
    .max(20, "Videos cannot be longer than 20 seconds")
    .optional()
    .nullable(),
});
