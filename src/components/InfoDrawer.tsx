import { Drawer, Box, Typography, IconButton } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'

interface InfoDrawerProps {
    isOpen: boolean
    handleClose: () => void
    selectedFlight?: GeoJSON.Feature<GeoJSON.Point> | null
}

export default function InfoDrawer({ isOpen, handleClose, selectedFlight }: InfoDrawerProps) {
    const flightData = {
        id: selectedFlight?.id,
        name: selectedFlight?.properties?.name,
        model: selectedFlight?.properties?.model,
        departure: "Istanbul (IST)",
        arrival: "Berlin (BER)",
        departureTime: "12:45",
        arrivalTime: "14:30",
        status: "On Time"
    }

    return (
        <Drawer anchor="right" variant="persistent" open={isOpen} onClose={handleClose}>
            <Box p={3} width={300} role="presentation" position="relative">
                <IconButton
                    onClick={handleClose}
                    sx={{ position: 'absolute', top: 8, right: 8 }}
                >
                    <CloseIcon />
                </IconButton>
                {selectedFlight && (
                    <>
                        <Typography variant="h6">Uçuş ID: {selectedFlight.id}</Typography>
                        <Typography variant="body1" color="text.secondary">
                            {flightData.name}
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            {flightData.model}
                        </Typography>
                        <Typography variant="body1" mt={2}>
                            ✈️ {flightData.departure} → {flightData.arrival}
                        </Typography>
                        <Typography variant="body1">
                            🕒 Kalkış: {flightData.departureTime}
                        </Typography>
                        <Typography variant="body1">
                            🕒 Varış: {flightData.arrivalTime}
                        </Typography>
                        <Typography variant="body1" color={flightData.status === "On Time" ? "green" : "red"}>
                            📌 Durum: {flightData.status}
                        </Typography>
                    </>
                )}
            </Box>
        </Drawer>
    )
}
