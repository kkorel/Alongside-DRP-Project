package models

import java.time.LocalDateTime

case class SupportRequest(
    id: Int,
    name: String,
    email: String,
    supportType: String,
    message: String,
    status: String,
    createdAt: LocalDateTime
)

case class CreateSupportRequest(
    name: String,
    email: String,
    supportType: String,
    message: String
)
