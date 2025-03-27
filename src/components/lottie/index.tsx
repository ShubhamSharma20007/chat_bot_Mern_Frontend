
import Lottie from 'react-lottie';
import Gradient from "../../../public/lottie-animate.json";
import { Box } from '@mui/material';
const LottieLoader = () => {
    return (
        <Box
            sx={{
                width: "300px",
                height: "300px",
            }}
        >
            <Lottie
                options={{
                    loop: true,
                    autoplay: true,
                    animationData: Gradient,
                }}

            />
        </Box>
    )
}

export default LottieLoader