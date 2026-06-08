import './WhatsAppButton.css';
import logoWhatsApp from '../assets/whatsapp.png';

const WHATSAPP_NUMBER = '5585984167002';
const WHATSAPP_MESSAGE = encodeURIComponent(
  'Atendimento Instituto LC'
);  

export default function WhatsAppButton() {

  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MESSAGE}`;

  return (

    <a href={url} target="_blank" rel="noopener noreferrer" className="whatsapp-btn">

      <img
        src={logoWhatsApp}
        alt="WhatsApp"
        className="whatsapp-btn__icon"
      />

      <span className="whatsapp-btn__label">Instituto LC</span>
    </a>
  );
}