import React, { useState } from 'react';
import { 
  Box, 
  IconButton, 
  Tooltip, 
  Menu, 
  MenuItem, 
  ListItemIcon, 
  ListItemText,
  Snackbar,
  Alert
} from '@mui/material';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import FacebookIcon from '@mui/icons-material/Facebook';
import ShareIcon from '@mui/icons-material/Share';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { useColorMode } from '@/Context/ColorModeContext';

interface ShareButtonsProps {
  title?: string;
  description?: string;
  url?: string;
  size?: 'small' | 'medium' | 'large';
  variant?: 'icon' | 'button' | 'dropdown';
}

const ShareButtons: React.FC<ShareButtonsProps> = ({
  title = 'Check out this car comparison on AiCarAdvisor!',
  description = 'AI-powered car comparison and recommendations',
  url,
  size = 'medium',
  variant = 'icon'
}) => {
  const { mode } = useColorMode();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [showCopySuccess, setShowCopySuccess] = useState(false);
  
  // Get current page URL if not provided
  const currentUrl = url || (typeof window !== 'undefined' ? window.location.href : '');
  
  const open = Boolean(anchorEl);
  
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleClose = () => {
    setAnchorEl(null);
  };
  
  // WhatsApp share function
  const shareOnWhatsApp = () => {
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${title}\n\n${description}\n\n${currentUrl}`)}`;
    window.open(whatsappUrl, '_blank');
    handleClose();
  };
  
  // Facebook share function
  const shareOnFacebook = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`;
    window.open(facebookUrl, '_blank');
    handleClose();
  };
  
  // Copy link function
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl);
      setShowCopySuccess(true);
      handleClose();
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = currentUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setShowCopySuccess(true);
      handleClose();
    }
  };
  
  const iconSize = size === 'small' ? 16 : size === 'large' ? 24 : 20;
  const buttonSize = size === 'small' ? 28 : size === 'large' ? 40 : 32;
  
  // Dropdown variant
  if (variant === 'dropdown') {
    return (
      <>
        <Tooltip title="Share">
          <IconButton
            onClick={handleClick}
            size="small"
            sx={{
              color: mode === 'dark' ? '#fff' : '#666',
              '&:hover': {
                bgcolor: mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
              },
              width: buttonSize,
              height: buttonSize,
              p: 0.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              verticalAlign: 'middle',
            }}
          >
            <ShareIcon sx={{ fontSize: iconSize, display: 'block' }} />
          </IconButton>
        </Tooltip>
        
        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          PaperProps={{
            sx: {
              minWidth: 200,
              mt: 1,
              '& .MuiMenuItem-root': {
                py: 1.5,
                px: 2,
              },
            },
          }}
        >
          <MenuItem onClick={shareOnWhatsApp}>
            <ListItemIcon>
              <WhatsAppIcon sx={{ color: '#25D366' }} />
            </ListItemIcon>
            <ListItemText primary="Share on WhatsApp" />
          </MenuItem>
          
          <MenuItem onClick={shareOnFacebook}>
            <ListItemIcon>
              <FacebookIcon sx={{ color: '#1877F2' }} />
            </ListItemIcon>
            <ListItemText primary="Share on Facebook" />
          </MenuItem>
          
          <MenuItem onClick={copyLink}>
            <ListItemIcon>
              <ContentCopyIcon />
            </ListItemIcon>
            <ListItemText primary="Copy Link" />
          </MenuItem>
        </Menu>
        
        <Snackbar
          open={showCopySuccess}
          autoHideDuration={3000}
          onClose={() => setShowCopySuccess(false)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert 
            onClose={() => setShowCopySuccess(false)} 
            severity="success" 
            sx={{ width: '100%' }}
          >
            Link copied to clipboard!
          </Alert>
        </Snackbar>
      </>
    );
  }
  
  if (variant === 'button') {
    return (
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
        <Tooltip title="Share on WhatsApp">
          <IconButton
            onClick={shareOnWhatsApp}
            size={size}
            sx={{
              bgcolor: '#25D366',
              color: 'white',
              '&:hover': {
                bgcolor: '#128C7E',
              },
              width: buttonSize,
              height: buttonSize,
            }}
          >
            <WhatsAppIcon sx={{ fontSize: iconSize }} />
          </IconButton>
        </Tooltip>
        
        <Tooltip title="Share on Facebook">
          <IconButton
            onClick={shareOnFacebook}
            size={size}
            sx={{
              bgcolor: '#1877F2',
              color: 'white',
              '&:hover': {
                bgcolor: '#166FE5',
              },
              width: buttonSize,
              height: buttonSize,
            }}
          >
            <FacebookIcon sx={{ fontSize: iconSize }} />
          </IconButton>
        </Tooltip>
      </Box>
    );
  }
  
  // Default icon variant
  return (
    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
      <Tooltip title="Share on WhatsApp">
        <IconButton
          onClick={shareOnWhatsApp}
          size={size}
          sx={{
            color: mode === 'dark' ? '#25D366' : '#25D366',
            '&:hover': {
              bgcolor: mode === 'dark' ? 'rgba(37, 211, 102, 0.1)' : 'rgba(37, 211, 102, 0.1)',
            },
          }}
        >
          <WhatsAppIcon sx={{ fontSize: iconSize }} />
        </IconButton>
      </Tooltip>
      
      <Tooltip title="Share on Facebook">
        <IconButton
          onClick={shareOnFacebook}
          size={size}
          sx={{
            color: mode === 'dark' ? '#1877F2' : '#1877F2',
            '&:hover': {
              bgcolor: mode === 'dark' ? 'rgba(24, 119, 242, 0.1)' : 'rgba(24, 119, 242, 0.1)',
            },
          }}
        >
          <FacebookIcon sx={{ fontSize: iconSize }} />
        </IconButton>
      </Tooltip>
    </Box>
  );
};

export default ShareButtons;
