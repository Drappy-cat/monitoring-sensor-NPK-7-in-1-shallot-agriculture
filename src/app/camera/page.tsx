import CameraPage from '@/components/camera/CameraPage';

export const metadata = {
  title: 'Kamera Lapangan — ESP32-CAM Monitoring',
  description:
    'Video live on-demand ESP32-CAM dengan auto-disconnect, rekam video demo, dan galeri timelapse tanaman bawang merah.',
};

export default function Camera() {
  return <CameraPage />;
}
