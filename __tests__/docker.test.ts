import { describe, it, expect, afterAll } from 'vitest'
import { execSync } from 'child_process'
import { setTimeout } from 'timers/promises'

describe('Docker Container Tests', () => {
  const imageName = 'signupvault-test'

  it('should build Docker image successfully', async () => {
    try {
      // Build the Docker image
      execSync(`docker build -t ${imageName} .`, {
        stdio: 'inherit',
        timeout: 300000 // 5 minutes timeout
      })

      // Verify the image was created
      const result = execSync(`docker images ${imageName} --format "{{.Repository}}:{{.Tag}}"`, {
        encoding: 'utf8'
      })
      expect(result.trim()).toBe(`${imageName}:latest`)
    } catch (error) {
      throw new Error(`Docker build failed: ${error instanceof Error ? error.message : String(error)}`)
    }
  }, 300000) // 5 minutes timeout

  it('should create container from image', async () => {
    try {
      // Create a container (don't start it yet)
      const containerId = execSync(`docker create --name test-container ${imageName}`, {
        encoding: 'utf8'
      }).trim()

      expect(containerId).toBeDefined()
      expect(containerId.length).toBeGreaterThan(0)

      // Clean up
      execSync(`docker rm ${containerId}`)
    } catch (error) {
      throw new Error(`Container creation failed: ${error instanceof Error ? error.message : String(error)}`)
    }
  })

  it('should have correct container structure', async () => {
    let containerId = ''
    try {
      // Create and start a container
      containerId = execSync(`docker run -d --name test-structure ${imageName}`, {
        encoding: 'utf8'
      }).trim()

      // Wait for container to start
      await setTimeout(2000)

      // Check if container is running
      const status = execSync(`docker inspect --format="{{.State.Status}}" ${containerId}`, {
        encoding: 'utf8'
      }).trim()

      expect(status).toBe('running')

      // Check that the application files exist
      const files = execSync(`docker exec ${containerId} ls -la /app`, {
        encoding: 'utf8'
      })

      expect(files).toContain('.next')
      expect(files).toContain('public')
      expect(files).toContain('node_modules')

    } catch (error) {
      throw new Error(`Container structure test failed: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      // Clean up
      if (containerId) {
        try {
          execSync(`docker stop ${containerId}`)
          execSync(`docker rm ${containerId}`)
        } catch {
          // Ignore cleanup errors
        }
      }
    }
  })

  it('should expose correct port', async () => {
    try {
      // Check the Dockerfile for exposed port
      const dockerfile = execSync('cat Dockerfile', { encoding: 'utf8' })
      expect(dockerfile).toContain('EXPOSE 3000')

      // Check that the image has the correct port configuration
      const ports = execSync(`docker inspect ${imageName} --format="{{.Config.ExposedPorts}}"`, {
        encoding: 'utf8'
      })

      expect(ports).toContain('3000/tcp')
    } catch (error) {
      throw new Error(`Port exposure test failed: ${error instanceof Error ? error.message : String(error)}`)
    }
  })

  it('should have correct environment variables', async () => {
    try {
      // Check that the image has the correct environment variables
      const env = execSync(`docker inspect ${imageName} --format="{{.Config.Env}}"`, {
        encoding: 'utf8'
      })

      expect(env).toContain('NODE_ENV=production')
      expect(env).toContain('PORT=3000')
    } catch (error) {
      throw new Error(`Environment variables test failed: ${error instanceof Error ? error.message : String(error)}`)
    }
  })

  it('should have health check endpoint', async () => {
    let containerId = ''
    try {
      // Create and start a container on a different port to avoid conflicts
      containerId = execSync(`docker run -d -p 3002:3000 --name test-health ${imageName}`, {
        encoding: 'utf8'
      }).trim()

      // Wait for container to start
      await setTimeout(5000)

      // Test the health endpoint (even if database is not connected, the endpoint should exist)
      const response = execSync('curl -s -o /dev/null -w "%{http_code}" http://localhost:3002/api/health', {
        encoding: 'utf8'
      }).trim()

      // Should return some HTTP status (even if 500 due to DB issues)
      expect(['200', '500', '503']).toContain(response)

    } catch (error) {
      throw new Error(`Health check test failed: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      // Clean up
      if (containerId) {
        try {
          execSync(`docker stop ${containerId}`)
          execSync(`docker rm ${containerId}`)
        } catch {
          // Ignore cleanup errors
        }
      }
    }
  }, 30000) // 30 seconds timeout

  // Cleanup after all tests
  afterAll(async () => {
    try {
      // Clean up test image
      execSync(`docker rmi ${imageName}`)
    } catch {
      // Ignore cleanup errors
    }
  })
})