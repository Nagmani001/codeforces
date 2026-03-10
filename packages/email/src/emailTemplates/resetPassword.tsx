import React from "react";
import {
  Html,
  Body,
  Container,
  Heading,
  Text,
  Button,
  Link,
  Hr,
} from "@react-email/components";

type ResetPasswordEmailProps = {
  url: string;
  token: string;
};

export default function ResetPasswordEmail({ url, token }: ResetPasswordEmailProps) {
  const resetUrl = `${url}?token=${token}`;

  return (
    <Html>
      <Body
        style={{
          fontFamily: "Arial, sans-serif",
          backgroundColor: "#f9fafb",
          padding: 20,
        }}
      >
        <Container
          style={{
            maxWidth: "520px",
            margin: "40px auto",
            padding: "24px",
            backgroundColor: "white",
            borderRadius: "8px",
            border: "1px solid #e5e7eb",
          }}
        >
          <Heading style={{ fontSize: "24px", marginBottom: "16px" }}>
            Reset your password
          </Heading>

          <Text style={{ marginBottom: 12 }}>
            You requested to reset your password. Click the button below to set a
            new password.
          </Text>

          <Button
            href={resetUrl}
            style={{
              backgroundColor: "#2563eb",
              color: "white",
              padding: "12px 20px",
              borderRadius: "6px",
              textDecoration: "none",
              display: "inline-block",
              marginTop: "16px",
            }}
          >
            Reset Password
          </Button>

          <Text style={{ marginTop: "20px" }}>
            If the button doesn't work, copy and paste this link into your
            browser:
          </Text>

          <Text style={{ wordBreak: "break-all", fontSize: "12px", marginTop: 8 }}>
            <Link href={resetUrl}>{resetUrl}</Link>
          </Text>

          <Hr style={{ margin: "24px 0" }} />

          <Text style={{ fontSize: "12px", color: "#6b7280" }}>
            If you didn’t request this, you can safely ignore this email.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
