#pragma once

#include "CoreMinimal.h"
#include "BaseballTypes.h"
#include "GameFramework/Pawn.h"
#include "DaesseuyoMvpPawn.generated.h"

class UAnimSequence;
class UCameraComponent;
class UDirectionalLightComponent;
class UMaterialInterface;
class USceneComponent;
class USkeletalMeshComponent;
class USkyLightComponent;
class UStaticMeshComponent;
class UTextRenderComponent;
class UTexture2D;

UCLASS()
class DAESSEUYO_API ADaesseuyoMvpPawn : public APawn
{
	GENERATED_BODY()

public:
	ADaesseuyoMvpPawn();

	virtual void BeginPlay() override;
	virtual void PossessedBy(AController* NewController) override;
	virtual void Tick(float DeltaSeconds) override;
	virtual void SetupPlayerInputComponent(UInputComponent* PlayerInputComponent) override;

	void GetMvpHudLines(TArray<FString>& OutLines) const;
	FVector GetBallPosition() const;
	FVector GetAimPoint() const;
	EMvpPlayPhase GetPlayPhase() const;
	bool ShouldRenderBallForHud() const;

private:
	UPROPERTY()
	USceneComponent* SceneRoot = nullptr;

	UPROPERTY()
	UCameraComponent* Camera = nullptr;

	UPROPERTY()
	UDirectionalLightComponent* SunLight = nullptr;

	UPROPERTY()
	USkyLightComponent* SkyLight = nullptr;

	UPROPERTY()
	UStaticMeshComponent* FieldPlane = nullptr;

	UPROPERTY()
	UStaticMeshComponent* InfieldClay = nullptr;

	UPROPERTY()
	UStaticMeshComponent* MoundMesh = nullptr;

	UPROPERTY()
	UStaticMeshComponent* PlateMesh = nullptr;

	UPROPERTY()
	UStaticMeshComponent* BallMesh = nullptr;

	UPROPERTY()
	UStaticMeshComponent* AimMesh = nullptr;

	UPROPERTY()
	UStaticMeshComponent* BatterMarker = nullptr;

	UPROPERTY()
	UStaticMeshComponent* PitcherMarker = nullptr;

	UPROPERTY()
	UStaticMeshComponent* StadiumBackdropPlane = nullptr;

	UPROPERTY()
	UStaticMeshComponent* StadiumBackdropPlaneReverse = nullptr;

	UPROPERTY()
	TArray<UStaticMeshComponent*> StadiumConcreteMeshes;

	UPROPERTY()
	TArray<UStaticMeshComponent*> StadiumDarkMeshes;

	UPROPERTY()
	TArray<UStaticMeshComponent*> StadiumLightMeshes;

	UPROPERTY()
	TArray<UStaticMeshComponent*> StadiumAdMeshes;

	UPROPERTY()
	TArray<UStaticMeshComponent*> StadiumCrowdMeshes;

	UPROPERTY()
	USkeletalMeshComponent* BatterMesh = nullptr;

	UPROPERTY()
	USkeletalMeshComponent* PitcherMesh = nullptr;

	UPROPERTY()
	USkeletalMeshComponent* CatcherMesh = nullptr;

	UPROPERTY()
	UStaticMeshComponent* BatMesh = nullptr;

	UPROPERTY()
	UStaticMeshComponent* PitcherGloveMesh = nullptr;

	UPROPERTY()
	UStaticMeshComponent* CatcherMittMesh = nullptr;

	UPROPERTY()
	UStaticMeshComponent* BatterHelmetMesh = nullptr;

	UPROPERTY()
	UStaticMeshComponent* PitcherCapMesh = nullptr;

	UPROPERTY()
	UStaticMeshComponent* CatcherMaskMesh = nullptr;

	UPROPERTY()
	UStaticMeshComponent* StrikeZoneTop = nullptr;

	UPROPERTY()
	UStaticMeshComponent* StrikeZoneBottom = nullptr;

	UPROPERTY()
	UStaticMeshComponent* StrikeZoneLeft = nullptr;

	UPROPERTY()
	UStaticMeshComponent* StrikeZoneRight = nullptr;

	UPROPERTY()
	UStaticMeshComponent* FoulLineLeft = nullptr;

	UPROPERTY()
	UStaticMeshComponent* FoulLineRight = nullptr;

	UPROPERTY()
	UStaticMeshComponent* FirstBaseMesh = nullptr;

	UPROPERTY()
	UStaticMeshComponent* SecondBaseMesh = nullptr;

	UPROPERTY()
	UStaticMeshComponent* ThirdBaseMesh = nullptr;

	UPROPERTY()
	UStaticMeshComponent* BatterBoxLeft = nullptr;

	UPROPERTY()
	UStaticMeshComponent* BatterBoxRight = nullptr;

	UPROPERTY()
	UStaticMeshComponent* OutfieldWall = nullptr;

	UPROPERTY()
	UStaticMeshComponent* ScoreboardPanel = nullptr;

	UPROPERTY()
	UTextRenderComponent* ScoreboardText = nullptr;

	UPROPERTY()
	UTextRenderComponent* RibbonBoardText = nullptr;

	UPROPERTY()
	UMaterialInterface* BaseShapeMaterial = nullptr;

	UPROPERTY()
	UMaterialInterface* TexturedMaterial = nullptr;

	UPROPERTY()
	UTexture2D* StadiumBackdropTexture = nullptr;

	UPROPERTY()
	UAnimSequence* IdleAnimation = nullptr;

	UPROPERTY()
	UAnimSequence* BatterSwingAnimation = nullptr;

	UPROPERTY()
	UAnimSequence* PitcherThrowAnimation = nullptr;

	EMvpPlayPhase Phase = EMvpPlayPhase::Ready;
	FBaseballCountState CountState;
	FBaseballPitchSpec CurrentPitch;

	FVector BallPosition = FVector::ZeroVector;
	FVector BallVelocity = FVector::ZeroVector;
	FVector PitchStart = FVector(1800.0f, 0.0f, 178.0f);
	FVector PitchTarget = FVector(90.0f, 0.0f, 130.0f);
	FVector AimPoint = FVector(90.0f, 0.0f, 130.0f);

	float ReadyTimer = 1.2f;
	float ResultTimer = 0.0f;
	float PitchElapsed = 0.0f;
	float PhysicsAccumulator = 0.0f;
	float AimSensitivity = 2.2f;
	float SwingVisualTimer = 0.0f;
	float PitcherVisualTimer = 0.0f;
	bool bSwingConsumed = false;
	bool bAtBatEnded = false;
	bool bUsingProductionOneAtBatAssets = false;
	FString LastResult = TEXT("9회말 2아웃, 한 점 차. 스페이스 또는 클릭으로 스윙.");

	void MoveAimX(float Value);
	void MoveAimY(float Value);
	void Swing();
	void ResetMvp();

	void StartNextPitch();
	void TickPitch(float DeltaSeconds);
	void TickBattedBall(float DeltaSeconds);
	void ResolveTakenPitch();
	void ResolveSwingMiss();
	void ResolveBattedBall();
	void AddStrike(const FString& Reason);
	void AddBall();
	void PutBallInPlay(float ContactQuality);

	FBaseballPitchSpec MakeRandomPitch() const;
	FString PitchName(EPitchType Type) const;
	FString PhaseLabel() const;
	void ApplyTint(UStaticMeshComponent* Mesh, const FLinearColor& Color) const;
	void ApplySkeletalTint(USkeletalMeshComponent* Mesh, const FLinearColor& Color) const;
	void ApplyMvpMaterials() const;
	void ApplyBackdropTexture();
	UTexture2D* LoadTextureFromProjectFile(const FString& RelativePath) const;
	void ConfigureController() const;
	void PlayIdlePresentation() const;
	void PlayBatterSwingPresentation();
	void PlayPitcherThrowPresentation();
	void UpdatePresentation(float DeltaSeconds);
	void UpdateMeshPositions() const;
	void DrawMvpDebug() const;
	void ShowHud() const;
	void SetCameraForBatterView() const;
	void UpdateCameraForPhase() const;
};
