#include "BaseballPhysics.h"

FVector FBaseballPhysics::Gravity()
{
	return FVector(0.0f, 0.0f, -980.0f);
}

FVector FBaseballPhysics::ComputePitchAcceleration(const FVector& Velocity, const FBaseballPitchSpec& Pitch)
{
	const float Speed = Velocity.Size();
	const FVector Drag = -Velocity * Speed * 0.000018f;
	const FVector SpinAxis = Pitch.SpinAxis.IsNearlyZero() ? FVector::UpVector : Pitch.SpinAxis.GetSafeNormal();
	const FVector MagnusDirection = FVector::CrossProduct(SpinAxis, Velocity).GetSafeNormal();
	const float MagnusStrength = FMath::Clamp(Pitch.SpinRpm / 2600.0f, 0.0f, 1.65f) * Pitch.MagnusScale * 185.0f;
	return Gravity() + Drag + MagnusDirection * MagnusStrength;
}

void FBaseballPhysics::StepPitch(FVector& Position, FVector& Velocity, const FBaseballPitchSpec& Pitch, float DeltaSeconds)
{
	const FVector Acceleration = ComputePitchAcceleration(Velocity, Pitch);
	Velocity += Acceleration * DeltaSeconds;
	Position += Velocity * DeltaSeconds;
}

void FBaseballPhysics::StepBattedBall(FVector& Position, FVector& Velocity, float DeltaSeconds)
{
	const float Speed = Velocity.Size();
	const FVector Drag = -Velocity * Speed * 0.000011f;
	Velocity += (Gravity() + Drag) * DeltaSeconds;
	Position += Velocity * DeltaSeconds;

	if (Position.Z < 3.8f)
	{
		Position.Z = 3.8f;
		Velocity.Z = FMath::Abs(Velocity.Z) * 0.42f;
		Velocity.X *= 0.72f;
		Velocity.Y *= 0.72f;
	}
}

FVector FBaseballPhysics::SolveInitialVelocity(const FVector& Start, const FVector& Target, float FlightTime)
{
	const float SafeTime = FMath::Max(0.1f, FlightTime);
	return (Target - Start - 0.5f * Gravity() * SafeTime * SafeTime) / SafeTime;
}

FVector FBaseballPhysics::ComputeBattedVelocity(const FVector& IncomingVelocity, const FVector& ContactPoint, const FVector& AimPoint, float TimingQuality, float AimQuality)
{
	const float Quality = FMath::Clamp((TimingQuality * 0.58f) + (AimQuality * 0.42f), 0.0f, 1.0f);
	const float PullSide = FMath::Clamp((AimPoint.Y - ContactPoint.Y) / 60.0f, -1.0f, 1.0f);
	const float ExitSpeed = FMath::Lerp(1850.0f, 5200.0f, Quality);
	const float LaunchDegrees = FMath::Lerp(7.0f, 28.0f, Quality);
	const float LaunchRadians = FMath::DegreesToRadians(LaunchDegrees);

	FVector Direction(
		FMath::Cos(LaunchRadians),
		PullSide * 0.28f + FMath::FRandRange(-0.12f, 0.12f),
		FMath::Sin(LaunchRadians)
	);
	Direction.Normalize();

	const float IncomingCarry = FMath::Clamp(IncomingVelocity.Size() / 4200.0f, 0.0f, 1.0f);
	return Direction * ExitSpeed * FMath::Lerp(0.92f, 1.08f, IncomingCarry);
}

bool FBaseballPhysics::IsStrikeLocation(const FVector& Position)
{
	return FMath::Abs(Position.Y) <= StrikeHalfWidth && Position.Z >= StrikeBottom && Position.Z <= StrikeTop;
}

float FBaseballPhysics::EstimateContactQuality(const FVector& BallPosition, const FVector& AimPoint)
{
	const float DistanceYZ = FVector2D::Distance(FVector2D(BallPosition.Y, BallPosition.Z), FVector2D(AimPoint.Y, AimPoint.Z));
	return 1.0f - FMath::Clamp(DistanceYZ / 92.0f, 0.0f, 1.0f);
}
