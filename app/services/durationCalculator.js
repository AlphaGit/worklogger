function calculateDurationInMinutes(endTime, startTime, minimumTimeSlotMinutes) {
    const duration = (endTime - startTime) / 1000 / 60;

    if (duration % minimumTimeSlotMinutes == 0)
        return duration;

    return minimumTimeSlotMinutes * Math.ceil(duration / minimumTimeSlotMinutes);
}

module.exports = {
    calculateDurationInMinutes
};