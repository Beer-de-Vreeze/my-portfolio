import React from 'react';
import styles from './Contributors.module.css';

const Contributors = ({ contributors }) => {
  // Predefined color palette
  const contributorColors = [
    '#FF6B6B', // red
    '#48BEFF', // blue
    '#4ECB71', // green
    '#FFD93D', // yellow
    '#B983FF', // purple
    '#FF9F45', // orange
    '#3DEFE9', // teal
    '#FF78C4', // pink
    '#7158E2', // indigo
    '#17C3B2', // mint
    '#FFC857', // amber
    '#4E8FF7', // royal blue
    '#FB5607', // deep orange
    '#3A86FF', // bright blue
    '#8AC926', // lime green
  ];

  // Function to determine text color based on background brightness
  const getTextColor = (bgColor) => {
    const r = parseInt(bgColor.slice(1, 3), 16);
    const g = parseInt(bgColor.slice(3, 5), 16);
    const b = parseInt(bgColor.slice(5, 7), 16);
    
    // Calculate brightness (perceived brightness formula)
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    
    return brightness > 128 ? '#000000' : '#FFFFFF';
  };

  return (
    <div className={styles.contributorsContainer}>
      <h2>Contributors</h2>
      <ul className={styles.contributorsList}>
        {contributors.map((contributor, index) => {
          // Assign color based on index, cycling through the color array if needed
          const bgColor = contributorColors[index % contributorColors.length];
          const textColor = getTextColor(bgColor);
          
          return (
            <li 
              key={index} 
              className={`${styles.contributorItem} w-full sm:w-auto text-center`}
              style={{ 
                backgroundColor: bgColor, 
                color: textColor,
                padding: '10px',
                margin: '5px',
                borderRadius: '4px',
                listStyle: 'none'
              }}
            >
              {contributor.image ? (
                <img 
                  src={contributor.image} 
                  alt={contributor.name || contributor} 
                  style={{ width: '100%', height: 'auto', display: 'block' }}
                />
              ) : (
                contributor.name || contributor
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default Contributors;
