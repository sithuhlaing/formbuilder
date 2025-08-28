// ... existing code
const ComponentIcon: React.FC<ComponentIconProps> = ({ type, className }) => {
  const getIcon = () => {
    switch (type) {
      case 'text_input':
        return <Type className={className} />;
      case 'number_input': // Add this case
        return <Hash className={className} />;
      case 'email_input':
        return <AtSign className={className} />;
      case 'password_input':
// ... existing code