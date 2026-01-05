"use client"

import type React from "react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ensureNonEmptyValue } from "@/lib/utils"

export default function WorkerRegistrationForm() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    department: "unassigned",
  })

  const handleChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    try {
      const response = await fetch("/api/worker", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        // Handle successful submission
        console.log("Worker registered successfully!")
        // Reset the form
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          address: "",
          city: "",
          state: "",
          zip: "",
          department: "unassigned",
        })
      } else {
        // Handle error
        console.error("Worker registration failed.")
      }
    } catch (error) {
      console.error("Error during worker registration:", error)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Worker Registration</CardTitle>
        <CardDescription>Register a new worker to the system.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="firstName">First Name*</Label>
            <Input
              id="firstName"
              value={formData.firstName}
              onChange={(e) => handleChange("firstName", e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="lastName">Last Name*</Label>
            <Input id="lastName" value={formData.lastName} onChange={(e) => handleChange("lastName", e.target.value)} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email*</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="phone">Phone*</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
            />
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="address">Address*</Label>
          <Input id="address" value={formData.address} onChange={(e) => handleChange("address", e.target.value)} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="city">City*</Label>
            <Input id="city" value={formData.city} onChange={(e) => handleChange("city", e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="state">State*</Label>
            <Input id="state" value={formData.state} onChange={(e) => handleChange("state", e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="zip">Zip Code*</Label>
            <Input id="zip" value={formData.zip} onChange={(e) => handleChange("zip", e.target.value)} />
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="department">Department*</Label>
          <Select
            value={ensureNonEmptyValue(formData.department)}
            onValueChange={(value) => handleChange("department", value === "unassigned" ? "" : value)}
          >
            <SelectTrigger id="department">
              <SelectValue placeholder="Select department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="unassigned">Select department</SelectItem>
              <SelectItem value="Assembly">Assembly</SelectItem>
              <SelectItem value="Woodworking">Woodworking</SelectItem>
              <SelectItem value="Finishing">Finishing</SelectItem>
              <SelectItem value="Quality Control">Quality Control</SelectItem>
              <SelectItem value="Packaging">Packaging</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button onClick={handleSubmit}>Register Worker</Button>
      </CardContent>
    </Card>
  )
}
