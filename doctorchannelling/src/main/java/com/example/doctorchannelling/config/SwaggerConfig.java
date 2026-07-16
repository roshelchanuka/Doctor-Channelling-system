package com.example.doctorchannelling.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;

@Configuration
public class SwaggerConfig {

        @Bean
        public OpenAPI customOpenAPI() {
                // 1. Definition of JWT Security Scheme

                final String securitySchemeName = "bearerAuth";

                return new OpenAPI()

                                // Setting up basic information about the API
                                .info(new Info()
                                                .title("Doctor Channelling API")
                                                .version("1.0")
                                                .description("Doctor Channelling පද්ධතිය සඳහා REST APIs"))

                                // Providing the ability to include Bearer Token in Swagger UI
                                .addSecurityItem(new SecurityRequirement().addList(securitySchemeName))
                                .components(new Components()
                                                .addSecuritySchemes(securitySchemeName,
                                                                new SecurityScheme()
                                                                                .name(securitySchemeName)
                                                                                .type(SecurityScheme.Type.HTTP)
                                                                                .scheme("bearer")
                                                                                .bearerFormat("JWT")
                                                                                .description("කරුණාකර ඔබගේ JWT Token එක මෙහි ඇතුලත් කරන්න (Bearer කොටස අවශ්‍ය නැත).")));
        }
}