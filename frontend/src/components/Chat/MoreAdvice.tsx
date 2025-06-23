import * as React from 'react';
import {
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Button,
  Typography,
} from '@mui/material';
import BrandSelector from './Model/InlineRadio';


interface BasicCardProps {
    title:string
}
const BasicCard:React.FC<BasicCardProps>=({title})=> {
  return (
    <Card sx={{ maxWidth: 345, margin: 'auto' }}>
      <CardMedia
        component="img"
        height="140"
        image="https://source.unsplash.com/random"
        alt="Random image"
      />
      <CardContent>
        {/* <Typography gutterBottom variant="h5" component="div">
         {title}
        </Typography> */}
        <Typography variant="body2" color="text.secondary">
          <BrandSelector label={title}  options={["5L-10L", "10L-15L"]}/>
        </Typography>
      </CardContent>
      <CardActions>
        
        
      </CardActions>
    </Card>
  );
}
export default BasicCard
