import React, { useEffect, useRef } from 'react';
import { Box, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const ChickenInvaders = ({ onClose }) => {
  const canvasRef = useRef(null);
  const gameRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let lastTime = 0;
    let score = 0;
    let gameOver = false;
    let level = 1;
    let lives = 3;
    let powerUps = [];
    let bossHealth = 0;
    let isBossLevel = false;
    let boss = null;
    let currentWave = 0;
    let waveStartTime = 0;
    let waveDuration = 10000; // 10 seconds per wave
    let waveInProgress = false;
    let waveChickens = [];
    let chickenProjectiles = [];

    // Load images
    const playerImg = new Image();
    playerImg.src = '/assets/images/ship.png';

    const chickenImg = new Image();
    chickenImg.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0MCA0MCI+PHBhdGggZD0iTTIwIDVjLTggMC0xNSA3LTE1IDE1czcgMTUgMTUgMTUgMTUtNyAxNS0xNS03LTE1LTE1LTE1em0wIDI4Yy03IDAtMTMtNi0xMy0xM3M2LTEzIDEzLTEzIDEzIDYgMTMgMTMtNiAxMy0xMyAxM3oiIGZpbGw9IiNmZjZiNmIiLz48Y2lyY2xlIGN4PSIxNSIgY3k9IjE1IiByPSIyIiBmaWxsPSIjMDAwIi8+PGNpcmNsZSBjeD0iMjUiIGN5PSIxNSIgcj0iMiIgZmlsbD0iIzAwMCIvPjxwYXRoIGQ9Ik0xNSAyNWMwIDAgMiA1IDUgNXMyLTUgNS01IiBzdHJva2U9IiMwMDAiIHN0cm9rZS13aWR0aD0iMiIgZmlsbD0ibm9uZSIvPjwvc3ZnPg==';

    const bulletImg = new Image();
    bulletImg.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1IDE1Ij48cGF0aCBkPSJNMi41IDBMMCA1aDVMMi41IDB6TTIuNSAxNUwwIDEwaDVMMi41IDE1eiIgZmlsbD0iI2ZmZDcwMCIvPjwvc3ZnPg==';

    const backgroundImg = new Image();
    backgroundImg.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4MDAiIGhlaWdodD0iNjAwIj48ZGVmcz48cGF0dGVybiBpZD0ic3RhcnMiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiIHdpZHRoPSI1IiBoZWlnaHQ9IjUiPjxjaXJjbGUgY3g9IjIuNSIgY3k9IjIuNSIgcj0iMSIgZmlsbD0iI2ZmZiIgZmlsbC1vcGFjaXR5PSIwLjMiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiMwMDAiLz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI3N0YXJzKSIvPjwvc3ZnPg==';

    const powerUpImg = new Image();
    powerUpImg.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzMCAzMCI+PGNpcmNsZSBjeD0iMTUiIGN5PSIxNSIgcj0iMTUiIGZpbGw9IiNmZmQ3MDAiLz48cGF0aCBkPSJNMTUgNUwxMiAxM2g4TDE1IDV6TTE1IDI1bDMtOC0zIDgtMy04IDN6IiBmaWxsPSIjZmZmIi8+PC9zdmc+';

    const bossImg = new Image();
    bossImg.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSI0MCIgZmlsbD0iI2ZmMDAwMCIvPjxjaXJjbGUgY3g9IjM1IiBjeT0iNDAiIHI9IjUiIGZpbGw9IiMwMDAiLz48Y2lyY2xlIGN4PSI2NSIgY3k9IjQwIiByPSI1IiBmaWxsPSIjMDAwIi8+PHBhdGggZD0iTTMwIDYwYzAgMCAxMCAyMCA0MCAyMHM0MC0yMCA0MC0yMCIgc3Ryb2tlPSIjMDAwIiBzdHJva2Utd2lkdGg9IjMiIGZpbGw9Im5vbmUiLz48L3N2Zz4=';

    const eggImg = new Image();
    eggImg.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMCAxNSI+PGVsbGlwc2UgY3g9IjUiIGN5PSI3LjUiIHJ4PSI0IiByeT0iNiIgZmlsbD0iI2ZmZiIvPjwvc3ZnPg==';

    // Game objects
    const player = {
      x: canvas.width / 2,
      y: canvas.height - 100,
      width: 80,
      height: 60,
      speed: 7,
      rotation: 0,
      powerUp: null,
      powerUpTime: 0
    };

    const bullets = [];
    let chickenSpeed = 2;
    const bulletSpeed = 7;
    let chickenSpawnInterval = 2000;
    let lastChickenSpawn = 0;
    let lastPowerUpSpawn = 0;
    let powerUpSpawnInterval = 10000;

    // Initialize wave
    const initializeWave = () => {
      waveChickens = [];
      chickenProjectiles = [];
      const rows = Math.min(3 + currentWave, 8);
      const cols = Math.min(5 + currentWave * 2, 16);
      chickenSpeed = 2 + currentWave * 0.7;
      const minShotInterval = Math.max(600, 2000 - currentWave * 200);
      const maxShotInterval = Math.max(900, 3000 - currentWave * 200);
      
      // Different wave patterns based on current wave
      const patterns = [
        // Pattern 1: Standard grid
        (i, j) => ({
          x: j * 60 + 50,
          y: i * 40 + 50,
          width: 40,
          height: 40,
          direction: 1,
          rotation: 0,
          health: Math.min(1 + Math.floor(currentWave / 2), 5),
          lastShot: 0,
          shotInterval: minShotInterval + Math.random() * (maxShotInterval - minShotInterval),
          pattern: 'grid'
        }),
        // Pattern 2: Zigzag
        (i, j) => ({
          x: j * 60 + 50 + (i % 2) * 30,
          y: i * 40 + 50,
          width: 40,
          height: 40,
          direction: 1,
          rotation: 0,
          health: Math.min(1 + Math.floor(currentWave / 2), 5),
          lastShot: 0,
          shotInterval: minShotInterval + Math.random() * (maxShotInterval - minShotInterval),
          pattern: 'zigzag'
        }),
        // Pattern 3: Diamond
        (i, j) => ({
          x: (j - Math.floor(cols/2)) * 60 + canvas.width/2 + (i % 2) * 30,
          y: i * 40 + 50,
          width: 40,
          height: 40,
          direction: 1,
          rotation: 0,
          health: Math.min(1 + Math.floor(currentWave / 2), 5),
          lastShot: 0,
          shotInterval: minShotInterval + Math.random() * (maxShotInterval - minShotInterval),
          pattern: 'diamond'
        }),
        // Pattern 4: Spiral
        (i, j) => {
          const angle = (i * cols + j) * (2 * Math.PI / (rows * cols));
          const radius = Math.min(i, j) * 40;
          return {
            x: canvas.width/2 + Math.cos(angle) * radius,
            y: canvas.height/4 + Math.sin(angle) * radius,
            width: 40,
            height: 40,
            direction: 1,
            rotation: 0,
            health: Math.min(1 + Math.floor(currentWave / 2), 5),
            lastShot: 0,
            shotInterval: minShotInterval + Math.random() * (maxShotInterval - minShotInterval),
            pattern: 'spiral'
          };
        },
        // Pattern 5: V-formation
        (i, j) => ({
          x: canvas.width/2 + (j - Math.floor(cols/2)) * 60 + Math.abs(i - Math.floor(rows/2)) * 20,
          y: i * 40 + 50,
          width: 40,
          height: 40,
          direction: 1,
          rotation: 0,
          health: Math.min(1 + Math.floor(currentWave / 2), 5),
          lastShot: 0,
          shotInterval: minShotInterval + Math.random() * (maxShotInterval - minShotInterval),
          pattern: 'v-formation'
        })
      ];

      const currentPattern = patterns[currentWave % patterns.length];
      
      for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
          waveChickens.push(currentPattern(i, j));
        }
      }
      waveStartTime = performance.now();
      waveInProgress = true;
    };

    // Initialize first wave
    initializeWave();

    // Event listeners
    const keys = {};
    window.addEventListener('keydown', (e) => {
      keys[e.key] = true;
      if (e.key === ' ' && !gameOver) {
        if (player.powerUp === 'double') {
          bullets.push(
            { x: player.x + player.width / 2 - 10, y: player.y, width: 5, height: 15, rotation: 0 },
            { x: player.x + player.width / 2 + 5, y: player.y, width: 5, height: 15, rotation: 0 }
          );
        } else {
          bullets.push({ x: player.x + player.width / 2 - 2.5, y: player.y, width: 5, height: 15, rotation: 0 });
        }
      }
    });
    window.addEventListener('keyup', (e) => {
      keys[e.key] = false;
    });

    // Game loop
    const gameLoop = (timestamp) => {
      if (!lastTime) lastTime = timestamp;
      const deltaTime = timestamp - lastTime;
      lastTime = timestamp;

      // Clear canvas
      ctx.drawImage(backgroundImg, 0, 0, canvas.width, canvas.height);

      // Check wave timer
      if (waveInProgress && timestamp - waveStartTime > waveDuration) {
        waveInProgress = false;
        currentWave++;
        if (currentWave < 5) {
          initializeWave();
        } else {
          level++;
          currentWave = 0;
          initializeWave();
        }
      }

      // Update power-up timer
      if (player.powerUp && timestamp - player.powerUpTime > 10000) {
        player.powerUp = null;
      }

      // Spawn power-ups
      if (timestamp - lastPowerUpSpawn > powerUpSpawnInterval) {
        powerUps.push({
          x: Math.random() * (canvas.width - 30),
          y: 0,
          width: 30,
          height: 30,
          type: Math.random() < 0.5 ? 'double' : 'shield'
        });
        lastPowerUpSpawn = timestamp;
      }

      // Move player
      if (keys['ArrowLeft'] && player.x > 0) {
        player.x -= player.speed;
        player.rotation = -15;
      } else if (keys['ArrowRight'] && player.x < canvas.width - player.width) {
        player.x += player.speed;
        player.rotation = 15;
      } else {
        player.rotation = 0;
      }
      if (keys['ArrowUp'] && player.y > 0) {
        player.y -= player.speed;
      }
      if (keys['ArrowDown'] && player.y < canvas.height - player.height) {
        player.y += player.speed;
      }

      // Draw player
      ctx.save();
      ctx.translate(player.x + player.width / 2, player.y + player.height / 2);
      ctx.rotate(player.rotation * Math.PI / 180);
      ctx.drawImage(playerImg, -player.width / 2, -player.height / 2, player.width, player.height);
      if (player.powerUp === 'shield') {
        ctx.beginPath();
        ctx.arc(0, 0, player.width, 0, Math.PI * 2);
        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
      ctx.restore();

      // Update and draw power-ups
      for (let i = powerUps.length - 1; i >= 0; i--) {
        const powerUp = powerUps[i];
        powerUp.y += 2;
        ctx.drawImage(powerUpImg, powerUp.x, powerUp.y, powerUp.width, powerUp.height);

        if (checkCollision(powerUp, player)) {
          player.powerUp = powerUp.type;
          player.powerUpTime = timestamp;
          powerUps.splice(i, 1);
        } else if (powerUp.y > canvas.height) {
          powerUps.splice(i, 1);
        }
      }

      // Update and draw bullets
      for (let i = bullets.length - 1; i >= 0; i--) {
        bullets[i].y -= bulletSpeed;
        bullets[i].rotation += 5;

        ctx.save();
        ctx.translate(bullets[i].x + bullets[i].width / 2, bullets[i].y + bullets[i].height / 2);
        ctx.rotate(bullets[i].rotation * Math.PI / 180);
        ctx.drawImage(bulletImg, -bullets[i].width / 2, -bullets[i].height / 2, bullets[i].width, bullets[i].height);
        ctx.restore();

        if (bullets[i].y < 0) {
          bullets.splice(i, 1);
        }
      }

      // Update and draw chicken projectiles
      for (let i = chickenProjectiles.length - 1; i >= 0; i--) {
        const projectile = chickenProjectiles[i];
        projectile.y += 3;
        projectile.rotation += 5;

        ctx.save();
        ctx.translate(projectile.x + projectile.width / 2, projectile.y + projectile.height / 2);
        ctx.rotate(projectile.rotation * Math.PI / 180);
        ctx.drawImage(eggImg, -projectile.width / 2, -projectile.height / 2, projectile.width, projectile.height);
        ctx.restore();

        // Check collision with player
        if (checkCollision(projectile, player)) {
          if (player.powerUp === 'shield') {
            player.powerUp = null;
          } else {
            lives--;
            if (lives <= 0) {
              gameOver = true;
            }
          }
          chickenProjectiles.splice(i, 1);
        } else if (projectile.y > canvas.height) {
          chickenProjectiles.splice(i, 1);
        }
      }

      // Update and draw chickens
      let moveDown = false;
      for (let i = waveChickens.length - 1; i >= 0; i--) {
        const chicken = waveChickens[i];
        
        // Different movement patterns based on chicken's pattern
        switch(chicken.pattern) {
          case 'grid':
            if (chicken.x <= 0 || chicken.x + chicken.width >= canvas.width) {
              moveDown = true;
            }
            if (moveDown) {
              chicken.y += 20;
              chicken.direction *= -1;
            } else {
              chicken.x += chickenSpeed * chicken.direction;
            }
            break;
          
          case 'zigzag':
            chicken.x += chickenSpeed * chicken.direction;
            chicken.y += Math.sin(timestamp / 1000) * 0.5;
            if (chicken.x <= 0 || chicken.x + chicken.width >= canvas.width) {
              chicken.direction *= -1;
              chicken.y += 10;
            }
            break;
          
          case 'diamond':
            const centerX = canvas.width / 2;
            const angle = timestamp / 1000;
            chicken.x = centerX + Math.cos(angle + i * 0.2) * 100;
            chicken.y += Math.sin(angle + i * 0.2) * 0.5;
            break;
          
          case 'spiral':
            const spiralAngle = timestamp / 1000 + i * 0.1;
            const spiralRadius = 100 + Math.sin(timestamp / 2000) * 20;
            chicken.x = canvas.width/2 + Math.cos(spiralAngle) * spiralRadius;
            chicken.y = canvas.height/4 + Math.sin(spiralAngle) * spiralRadius;
            chicken.rotation = spiralAngle * 180 / Math.PI;
            break;
          
          case 'v-formation':
            chicken.x += chickenSpeed * chicken.direction;
            if (chicken.x <= 0 || chicken.x + chicken.width >= canvas.width) {
              chicken.direction *= -1;
              chicken.y += 15;
            }
            chicken.rotation = Math.sin(timestamp / 500) * 15;
            break;
        }

        // Chicken shooting
        if (timestamp - chicken.lastShot > chicken.shotInterval) {
          chickenProjectiles.push({
            x: chicken.x + chicken.width / 2 - 5,
            y: chicken.y + chicken.height,
            width: 10,
            height: 15,
            rotation: 0
          });
          chicken.lastShot = timestamp;
        }

        ctx.save();
        ctx.translate(chicken.x + chicken.width / 2, chicken.y + chicken.height / 2);
        ctx.rotate(chicken.rotation * Math.PI / 180);
        ctx.drawImage(chickenImg, -chicken.width / 2, -chicken.height / 2, chicken.width, chicken.height);
        ctx.restore();

        // Check collision with bullets
        for (let j = bullets.length - 1; j >= 0; j--) {
          if (!bullets[j].isEnemy && checkCollision(bullets[j], chicken)) {
            chicken.health--;
            bullets.splice(j, 1);
            if (chicken.health <= 0) {
              waveChickens.splice(i, 1);
              score += 100;
              if (Math.random() < 0.1) {
                powerUps.push({
                  x: chicken.x,
                  y: chicken.y,
                  width: 30,
                  height: 30,
                  type: Math.random() < 0.5 ? 'double' : 'shield'
                });
              }
            }
            break;
          }
        }

        // Check collision with player
        if (checkCollision(chicken, player)) {
          if (player.powerUp === 'shield') {
            player.powerUp = null;
          } else {
            lives--;
            if (lives <= 0) {
              gameOver = true;
            } else {
              waveChickens.splice(i, 1);
            }
          }
        }
      }

      // Draw HUD
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 24px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(`Score: ${score}`, 20, 40);
      ctx.fillText(`Level: ${level}`, 20, 70);
      ctx.fillText(`Lives: ${lives}`, 20, 100);
      ctx.fillText(`Wave: ${currentWave + 1}/5`, 20, 130);
      
      if (player.powerUp) {
        ctx.fillText(`Power-up: ${player.powerUp}`, 20, 160);
      }

      // Draw wave timer
      if (waveInProgress) {
        const timeLeft = Math.ceil((waveDuration - (timestamp - waveStartTime)) / 1000);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 36px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`${timeLeft}`, canvas.width / 2, 40);
      }

      // Draw game over
      if (gameOver) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Game Over!', canvas.width / 2, canvas.height / 2 - 40);
        
        ctx.font = 'bold 24px Arial';
        ctx.fillText(`Final Score: ${score}`, canvas.width / 2, canvas.height / 2 + 20);
        ctx.fillText(`Level Reached: ${level}`, canvas.width / 2, canvas.height / 2 + 50);
        ctx.fillText('Press R to Restart', canvas.width / 2, canvas.height / 2 + 90);
        
        if (keys['r']) {
          score = 0;
          level = 1;
          currentWave = 0;
          lives = 3;
          gameOver = false;
          player.powerUp = null;
          initializeWave();
        }
      }

      animationFrameId = window.requestAnimationFrame(gameLoop);
    };

    // Collision detection
    const checkCollision = (rect1, rect2) => {
      return rect1.x < rect2.x + rect2.width &&
             rect1.x + rect1.width > rect2.x &&
             rect1.y < rect2.y + rect2.height &&
             rect1.y + rect1.height > rect2.y;
    };

    // Start game loop
    gameLoop();

    // Cleanup
    return () => {
      window.cancelAnimationFrame(animationFrameId);
      window.removeEventListener('keydown', () => {});
      window.removeEventListener('keyup', () => {});
    };
  }, []);

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        zIndex: 9999,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
      }}
    >
      <IconButton
        onClick={onClose}
        sx={{
          position: 'absolute',
          top: 16,
          right: 16,
          color: 'white',
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
          },
        }}
      >
        <CloseIcon />
      </IconButton>
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        style={{
          border: '2px solid #037ef3',
          borderRadius: '8px',
          boxShadow: '0 0 20px rgba(3, 126, 243, 0.3)',
        }}
      />
      <Box sx={{ color: 'white', mt: 2, textAlign: 'center' }}>
        <p style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Use Arrow Keys to move and Space to shoot</p>
        <p style={{ fontSize: '1.2rem' }}>Press R to restart when game is over</p>
      </Box>
    </Box>
  );
};

export default ChickenInvaders; 