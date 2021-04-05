export function calculateDurationInMinutes(endTime: Date, startTime: Date, minimumTimeSlotMinutes: number): number {
    const duration = (endTime.getTime() - startTime.getTime()) / 1000 / 60;

    if (duration % minimumTimeSlotMinutes == 0)
        return duration;

    return minimumTimeSlotMinutes * Math.ceil(duration / minimumTimeSlotMinutes);
}
