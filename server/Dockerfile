# Use the official AWS Lambda Node.js 20 runtime base image as the foundation for the build stage
# This provides a pre-configured runtime environment optimized for AWS Lambda functions
FROM public.ecr.aws/lambda/nodejs:20 AS build

# Set the working directory inside the container to /app
# All subsequent commands will run relative to this directory
WORKDIR /app

# Copy the package.json and package-lock.json files into the container
# This step is necessary to install project dependencies
COPY package*.json ./

# Install all dependencies, including dev dependencies
# Dev dependencies are needed here for tasks like TypeScript compilation or testing
RUN npm install

# Copy the rest of the application's source code into the container
# This includes all files (source code, configuration, etc.) except those excluded by .dockerignore
COPY . .

# Build the TypeScript source code into JavaScript
# Assumes a "build" script is defined in package.json to compile TypeScript
RUN npm run build

# Remove development dependencies to reduce the size of the production image
# Only the runtime dependencies required for running the application will remain
RUN npm prune --production

# Start the second stage to create the final production image
# Use the same AWS Lambda Node.js 20 runtime base image to maintain compatibility
FROM public.ecr.aws/lambda/nodejs:20

# Set the working directory for the production image to the Lambda task root directory
# AWS Lambda requires the function code to be in this specific directory
WORKDIR ${LAMBDA_TASK_ROOT}

# Copy the built JavaScript files and the node_modules directory from the build stage
# This includes only the compiled application code and its production dependencies
COPY --from=build /app/dist ${LAMBDA_TASK_ROOT}
COPY --from=build /app/node_modules ${LAMBDA_TASK_ROOT}/node_modules

# Optionally copy the package.json file for reference or debugging
# This is not strictly necessary for the function to run
COPY --from=build /app/package*.json ${LAMBDA_TASK_ROOT}

# Set the environment variable to indicate that the application is running in production mode
# This is used by many Node.js packages to optimize performance
ENV NODE_ENV=production

# Specify the command to run the Lambda function
# AWS Lambda will call the "handler" function in the "index.js" file by default
CMD ["index.handler"]
