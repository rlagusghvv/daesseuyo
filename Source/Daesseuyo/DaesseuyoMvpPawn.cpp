#include "DaesseuyoMvpPawn.h"
#include "BaseballPhysics.h"
#include "Animation/AnimSequence.h"
#include "Camera/CameraComponent.h"
#include "Components/DirectionalLightComponent.h"
#include "Components/InputComponent.h"
#include "Components/SceneComponent.h"
#include "Components/SkeletalMeshComponent.h"
#include "Components/SkyLightComponent.h"
#include "Components/StaticMeshComponent.h"
#include "Components/TextRenderComponent.h"
#include "DrawDebugHelpers.h"
#include "Engine/Engine.h"
#include "Engine/SkeletalMesh.h"
#include "Engine/StaticMesh.h"
#include "Engine/Texture2D.h"
#include "GameFramework/PlayerController.h"
#include "IImageWrapper.h"
#include "IImageWrapperModule.h"
#include "Misc/FileHelper.h"
#include "Misc/PackageName.h"
#include "Misc/Paths.h"
#include "Modules/ModuleManager.h"
#include "Materials/MaterialInstanceDynamic.h"
#include "Materials/MaterialInterface.h"
#include "UObject/ConstructorHelpers.h"

ADaesseuyoMvpPawn::ADaesseuyoMvpPawn()
{
	PrimaryActorTick.bCanEverTick = true;
	AutoPossessPlayer = EAutoReceiveInput::Player0;

	SceneRoot = CreateDefaultSubobject<USceneComponent>(TEXT("SceneRoot"));
	SetRootComponent(SceneRoot);

	Camera = CreateDefaultSubobject<UCameraComponent>(TEXT("BatterCamera"));
	Camera->SetupAttachment(SceneRoot);

	SunLight = CreateDefaultSubobject<UDirectionalLightComponent>(TEXT("SunLight"));
	SunLight->SetupAttachment(SceneRoot);
	SunLight->SetRelativeRotation(FRotator(-42.0f, -35.0f, 0.0f));
	SunLight->SetIntensity(3.2f);

	SkyLight = CreateDefaultSubobject<USkyLightComponent>(TEXT("SkyLight"));
	SkyLight->SetupAttachment(SceneRoot);
	SkyLight->SetIntensity(1.1f);

	FieldPlane = CreateDefaultSubobject<UStaticMeshComponent>(TEXT("DebugField"));
	FieldPlane->SetupAttachment(SceneRoot);

	InfieldClay = CreateDefaultSubobject<UStaticMeshComponent>(TEXT("InfieldClay"));
	InfieldClay->SetupAttachment(SceneRoot);

	MoundMesh = CreateDefaultSubobject<UStaticMeshComponent>(TEXT("Mound"));
	MoundMesh->SetupAttachment(SceneRoot);

	PlateMesh = CreateDefaultSubobject<UStaticMeshComponent>(TEXT("HomePlate"));
	PlateMesh->SetupAttachment(SceneRoot);

	BallMesh = CreateDefaultSubobject<UStaticMeshComponent>(TEXT("Ball"));
	BallMesh->SetupAttachment(SceneRoot);
	BallMesh->SetCollisionProfileName(TEXT("NoCollision"));

	AimMesh = CreateDefaultSubobject<UStaticMeshComponent>(TEXT("AimReticle"));
	AimMesh->SetupAttachment(SceneRoot);
	AimMesh->SetCollisionProfileName(TEXT("NoCollision"));

	BatterMarker = CreateDefaultSubobject<UStaticMeshComponent>(TEXT("BatterMarker"));
	BatterMarker->SetupAttachment(SceneRoot);

	PitcherMarker = CreateDefaultSubobject<UStaticMeshComponent>(TEXT("PitcherMarker"));
	PitcherMarker->SetupAttachment(SceneRoot);

	StadiumBackdropPlane = CreateDefaultSubobject<UStaticMeshComponent>(TEXT("StadiumBackdropPlane"));
	StadiumBackdropPlane->SetupAttachment(SceneRoot);
	StadiumBackdropPlane->SetCollisionProfileName(TEXT("NoCollision"));

	StadiumBackdropPlaneReverse = CreateDefaultSubobject<UStaticMeshComponent>(TEXT("StadiumBackdropPlaneReverse"));
	StadiumBackdropPlaneReverse->SetupAttachment(SceneRoot);
	StadiumBackdropPlaneReverse->SetCollisionProfileName(TEXT("NoCollision"));

	auto MakeStadiumMesh = [this](const TCHAR* Name, TArray<UStaticMeshComponent*>& Bucket)
	{
		UStaticMeshComponent* Mesh = CreateDefaultSubobject<UStaticMeshComponent>(Name);
		Mesh->SetupAttachment(SceneRoot);
		Mesh->SetCollisionProfileName(TEXT("NoCollision"));
		Bucket.Add(Mesh);
		return Mesh;
	};

	MakeStadiumMesh(TEXT("LowerBowlLeft"), StadiumConcreteMeshes);
	MakeStadiumMesh(TEXT("LowerBowlRight"), StadiumConcreteMeshes);
	MakeStadiumMesh(TEXT("LowerBowlCenter"), StadiumConcreteMeshes);
	MakeStadiumMesh(TEXT("UpperBowlLeft"), StadiumConcreteMeshes);
	MakeStadiumMesh(TEXT("UpperBowlRight"), StadiumConcreteMeshes);
	MakeStadiumMesh(TEXT("DugoutLeft"), StadiumDarkMeshes);
	MakeStadiumMesh(TEXT("DugoutRight"), StadiumDarkMeshes);
	MakeStadiumMesh(TEXT("BatterEyePanel"), StadiumDarkMeshes);
	MakeStadiumMesh(TEXT("LightTowerLeft"), StadiumConcreteMeshes);
	MakeStadiumMesh(TEXT("LightTowerRight"), StadiumConcreteMeshes);
	MakeStadiumMesh(TEXT("LightPanelLeft"), StadiumLightMeshes);
	MakeStadiumMesh(TEXT("LightPanelRight"), StadiumLightMeshes);
	MakeStadiumMesh(TEXT("AdBoardLeft"), StadiumAdMeshes);
	MakeStadiumMesh(TEXT("AdBoardRight"), StadiumAdMeshes);
	MakeStadiumMesh(TEXT("RibbonBoard"), StadiumAdMeshes);
	MakeStadiumMesh(TEXT("CrowdBandLeft"), StadiumCrowdMeshes);
	MakeStadiumMesh(TEXT("CrowdBandRight"), StadiumCrowdMeshes);
	MakeStadiumMesh(TEXT("CrowdBandCenter"), StadiumCrowdMeshes);

	BatterMesh = CreateDefaultSubobject<USkeletalMeshComponent>(TEXT("BatterMesh"));
	BatterMesh->SetupAttachment(SceneRoot);
	BatterMesh->SetCollisionProfileName(TEXT("NoCollision"));

	PitcherMesh = CreateDefaultSubobject<USkeletalMeshComponent>(TEXT("PitcherMesh"));
	PitcherMesh->SetupAttachment(SceneRoot);
	PitcherMesh->SetCollisionProfileName(TEXT("NoCollision"));

	CatcherMesh = CreateDefaultSubobject<USkeletalMeshComponent>(TEXT("CatcherMesh"));
	CatcherMesh->SetupAttachment(SceneRoot);
	CatcherMesh->SetCollisionProfileName(TEXT("NoCollision"));

	BatMesh = CreateDefaultSubobject<UStaticMeshComponent>(TEXT("Bat"));
	BatMesh->SetupAttachment(SceneRoot);
	BatMesh->SetCollisionProfileName(TEXT("NoCollision"));

	PitcherGloveMesh = CreateDefaultSubobject<UStaticMeshComponent>(TEXT("PitcherGlove"));
	PitcherGloveMesh->SetupAttachment(SceneRoot);
	PitcherGloveMesh->SetCollisionProfileName(TEXT("NoCollision"));

	CatcherMittMesh = CreateDefaultSubobject<UStaticMeshComponent>(TEXT("CatcherMitt"));
	CatcherMittMesh->SetupAttachment(SceneRoot);
	CatcherMittMesh->SetCollisionProfileName(TEXT("NoCollision"));

	BatterHelmetMesh = CreateDefaultSubobject<UStaticMeshComponent>(TEXT("BatterHelmet"));
	BatterHelmetMesh->SetupAttachment(SceneRoot);
	BatterHelmetMesh->SetCollisionProfileName(TEXT("NoCollision"));

	PitcherCapMesh = CreateDefaultSubobject<UStaticMeshComponent>(TEXT("PitcherCap"));
	PitcherCapMesh->SetupAttachment(SceneRoot);
	PitcherCapMesh->SetCollisionProfileName(TEXT("NoCollision"));

	CatcherMaskMesh = CreateDefaultSubobject<UStaticMeshComponent>(TEXT("CatcherMask"));
	CatcherMaskMesh->SetupAttachment(SceneRoot);
	CatcherMaskMesh->SetCollisionProfileName(TEXT("NoCollision"));

	StrikeZoneTop = CreateDefaultSubobject<UStaticMeshComponent>(TEXT("StrikeZoneTop"));
	StrikeZoneTop->SetupAttachment(SceneRoot);
	StrikeZoneTop->SetCollisionProfileName(TEXT("NoCollision"));

	StrikeZoneBottom = CreateDefaultSubobject<UStaticMeshComponent>(TEXT("StrikeZoneBottom"));
	StrikeZoneBottom->SetupAttachment(SceneRoot);
	StrikeZoneBottom->SetCollisionProfileName(TEXT("NoCollision"));

	StrikeZoneLeft = CreateDefaultSubobject<UStaticMeshComponent>(TEXT("StrikeZoneLeft"));
	StrikeZoneLeft->SetupAttachment(SceneRoot);
	StrikeZoneLeft->SetCollisionProfileName(TEXT("NoCollision"));

	StrikeZoneRight = CreateDefaultSubobject<UStaticMeshComponent>(TEXT("StrikeZoneRight"));
	StrikeZoneRight->SetupAttachment(SceneRoot);
	StrikeZoneRight->SetCollisionProfileName(TEXT("NoCollision"));

	FoulLineLeft = CreateDefaultSubobject<UStaticMeshComponent>(TEXT("FoulLineLeft"));
	FoulLineLeft->SetupAttachment(SceneRoot);
	FoulLineLeft->SetCollisionProfileName(TEXT("NoCollision"));

	FoulLineRight = CreateDefaultSubobject<UStaticMeshComponent>(TEXT("FoulLineRight"));
	FoulLineRight->SetupAttachment(SceneRoot);
	FoulLineRight->SetCollisionProfileName(TEXT("NoCollision"));

	FirstBaseMesh = CreateDefaultSubobject<UStaticMeshComponent>(TEXT("FirstBase"));
	FirstBaseMesh->SetupAttachment(SceneRoot);
	FirstBaseMesh->SetCollisionProfileName(TEXT("NoCollision"));

	SecondBaseMesh = CreateDefaultSubobject<UStaticMeshComponent>(TEXT("SecondBase"));
	SecondBaseMesh->SetupAttachment(SceneRoot);
	SecondBaseMesh->SetCollisionProfileName(TEXT("NoCollision"));

	ThirdBaseMesh = CreateDefaultSubobject<UStaticMeshComponent>(TEXT("ThirdBase"));
	ThirdBaseMesh->SetupAttachment(SceneRoot);
	ThirdBaseMesh->SetCollisionProfileName(TEXT("NoCollision"));

	BatterBoxLeft = CreateDefaultSubobject<UStaticMeshComponent>(TEXT("BatterBoxLeft"));
	BatterBoxLeft->SetupAttachment(SceneRoot);
	BatterBoxLeft->SetCollisionProfileName(TEXT("NoCollision"));

	BatterBoxRight = CreateDefaultSubobject<UStaticMeshComponent>(TEXT("BatterBoxRight"));
	BatterBoxRight->SetupAttachment(SceneRoot);
	BatterBoxRight->SetCollisionProfileName(TEXT("NoCollision"));

	OutfieldWall = CreateDefaultSubobject<UStaticMeshComponent>(TEXT("OutfieldWall"));
	OutfieldWall->SetupAttachment(SceneRoot);
	OutfieldWall->SetCollisionProfileName(TEXT("NoCollision"));

	ScoreboardPanel = CreateDefaultSubobject<UStaticMeshComponent>(TEXT("ScoreboardPanel"));
	ScoreboardPanel->SetupAttachment(SceneRoot);
	ScoreboardPanel->SetCollisionProfileName(TEXT("NoCollision"));

	ScoreboardText = CreateDefaultSubobject<UTextRenderComponent>(TEXT("ScoreboardText"));
	ScoreboardText->SetupAttachment(SceneRoot);
	ScoreboardText->SetHorizontalAlignment(EHTA_Center);
	ScoreboardText->SetVerticalAlignment(EVRTA_TextCenter);
	ScoreboardText->SetTextRenderColor(FColor(255, 215, 90));
	ScoreboardText->SetWorldSize(86.0f);
	ScoreboardText->SetText(FText::FromString(TEXT("DAESSEUYO\n9TH BOT 2 OUT")));

	RibbonBoardText = CreateDefaultSubobject<UTextRenderComponent>(TEXT("RibbonBoardText"));
	RibbonBoardText->SetupAttachment(SceneRoot);
	RibbonBoardText->SetHorizontalAlignment(EHTA_Center);
	RibbonBoardText->SetVerticalAlignment(EVRTA_TextCenter);
	RibbonBoardText->SetTextRenderColor(FColor(235, 245, 255));
	RibbonBoardText->SetWorldSize(56.0f);
	RibbonBoardText->SetText(FText::FromString(TEXT("SEOUL BRIDGES  vs  BUSAN HARBORS")));

	static ConstructorHelpers::FObjectFinder<UStaticMesh> PlaneMesh(TEXT("/Engine/BasicShapes/Plane.Plane"));
	static ConstructorHelpers::FObjectFinder<UStaticMesh> SphereMesh(TEXT("/Engine/BasicShapes/Sphere.Sphere"));
	static ConstructorHelpers::FObjectFinder<UStaticMesh> CylinderMesh(TEXT("/Engine/BasicShapes/Cylinder.Cylinder"));
	static ConstructorHelpers::FObjectFinder<UStaticMesh> CubeMesh(TEXT("/Engine/BasicShapes/Cube.Cube"));
	static ConstructorHelpers::FObjectFinder<USkeletalMesh> MannyMesh(TEXT("/Game/Characters/Mannequins/Meshes/SKM_Manny_Simple.SKM_Manny_Simple"));
	static ConstructorHelpers::FObjectFinder<USkeletalMesh> QuinnMesh(TEXT("/Game/Characters/Mannequins/Meshes/SKM_Quinn_Simple.SKM_Quinn_Simple"));
	static ConstructorHelpers::FObjectFinder<UAnimSequence> IdleAnim(TEXT("/Game/Characters/Mannequins/Anims/Unarmed/MM_Idle.MM_Idle"));
	static ConstructorHelpers::FObjectFinder<UAnimSequence> SwingAnim(TEXT("/Game/Characters/Mannequins/Anims/Unarmed/Attack/MM_Attack_02.MM_Attack_02"));
	static ConstructorHelpers::FObjectFinder<UAnimSequence> ThrowAnim(TEXT("/Game/Characters/Mannequins/Anims/Unarmed/Attack/MM_Attack_01.MM_Attack_01"));
	static ConstructorHelpers::FObjectFinder<UMaterialInterface> BasicShapeMaterial(TEXT("/Engine/BasicShapes/BasicShapeMaterial.BasicShapeMaterial"));
	static ConstructorHelpers::FObjectFinder<UMaterialInterface> EmissiveTexturedMaterial(TEXT("/Engine/EngineMaterials/EmissiveTexturedMaterial.EmissiveTexturedMaterial"));

	if (BasicShapeMaterial.Succeeded())
	{
		BaseShapeMaterial = BasicShapeMaterial.Object;
	}
	if (EmissiveTexturedMaterial.Succeeded())
	{
		TexturedMaterial = EmissiveTexturedMaterial.Object;
	}

	if (PlaneMesh.Succeeded())
	{
		FieldPlane->SetStaticMesh(PlaneMesh.Object);
		InfieldClay->SetStaticMesh(PlaneMesh.Object);
		StadiumBackdropPlane->SetStaticMesh(PlaneMesh.Object);
		StadiumBackdropPlaneReverse->SetStaticMesh(PlaneMesh.Object);
	}
	if (SphereMesh.Succeeded())
	{
		BallMesh->SetStaticMesh(SphereMesh.Object);
		AimMesh->SetStaticMesh(SphereMesh.Object);
		BatterMarker->SetStaticMesh(SphereMesh.Object);
		PitcherMarker->SetStaticMesh(SphereMesh.Object);
		PitcherGloveMesh->SetStaticMesh(SphereMesh.Object);
		CatcherMittMesh->SetStaticMesh(SphereMesh.Object);
		BatterHelmetMesh->SetStaticMesh(SphereMesh.Object);
		PitcherCapMesh->SetStaticMesh(SphereMesh.Object);
		CatcherMaskMesh->SetStaticMesh(SphereMesh.Object);
	}
	if (CylinderMesh.Succeeded())
	{
		MoundMesh->SetStaticMesh(CylinderMesh.Object);
		BatMesh->SetStaticMesh(CylinderMesh.Object);
	}
	if (CubeMesh.Succeeded())
	{
		PlateMesh->SetStaticMesh(CubeMesh.Object);
		StrikeZoneTop->SetStaticMesh(CubeMesh.Object);
		StrikeZoneBottom->SetStaticMesh(CubeMesh.Object);
		StrikeZoneLeft->SetStaticMesh(CubeMesh.Object);
		StrikeZoneRight->SetStaticMesh(CubeMesh.Object);
		FoulLineLeft->SetStaticMesh(CubeMesh.Object);
		FoulLineRight->SetStaticMesh(CubeMesh.Object);
		FirstBaseMesh->SetStaticMesh(CubeMesh.Object);
		SecondBaseMesh->SetStaticMesh(CubeMesh.Object);
		ThirdBaseMesh->SetStaticMesh(CubeMesh.Object);
		BatterBoxLeft->SetStaticMesh(CubeMesh.Object);
		BatterBoxRight->SetStaticMesh(CubeMesh.Object);
		OutfieldWall->SetStaticMesh(CubeMesh.Object);
		ScoreboardPanel->SetStaticMesh(CubeMesh.Object);
		for (UStaticMeshComponent* Mesh : StadiumConcreteMeshes)
		{
			Mesh->SetStaticMesh(CubeMesh.Object);
		}
		for (UStaticMeshComponent* Mesh : StadiumDarkMeshes)
		{
			Mesh->SetStaticMesh(CubeMesh.Object);
		}
		for (UStaticMeshComponent* Mesh : StadiumLightMeshes)
		{
			Mesh->SetStaticMesh(CubeMesh.Object);
		}
		for (UStaticMeshComponent* Mesh : StadiumAdMeshes)
		{
			Mesh->SetStaticMesh(CubeMesh.Object);
		}
		for (UStaticMeshComponent* Mesh : StadiumCrowdMeshes)
		{
			Mesh->SetStaticMesh(CubeMesh.Object);
		}
	}
	if (MannyMesh.Succeeded())
	{
		BatterMesh->SetSkeletalMesh(MannyMesh.Object);
		PitcherMesh->SetSkeletalMesh(MannyMesh.Object);
	}
	if (QuinnMesh.Succeeded())
	{
		CatcherMesh->SetSkeletalMesh(QuinnMesh.Object);
	}
	if (IdleAnim.Succeeded())
	{
		IdleAnimation = IdleAnim.Object;
	}
	if (SwingAnim.Succeeded())
	{
		BatterSwingAnimation = SwingAnim.Object;
	}
	if (ThrowAnim.Succeeded())
	{
		PitcherThrowAnimation = ThrowAnim.Object;
	}

	auto OptionalAssetExists = [](const TCHAR* PackagePath)
	{
		const FString AssetFilename = FPackageName::LongPackageNameToFilename(PackagePath, FPackageName::GetAssetPackageExtension());
		return FPaths::FileExists(AssetFilename);
	};
	auto LoadOptionalSkeletalMesh = [&OptionalAssetExists](const TCHAR* ObjectPath, const TCHAR* PackagePath)
	{
		return OptionalAssetExists(PackagePath) ? LoadObject<USkeletalMesh>(nullptr, ObjectPath) : nullptr;
	};
	auto LoadOptionalStaticMesh = [&OptionalAssetExists](const TCHAR* ObjectPath, const TCHAR* PackagePath)
	{
		return OptionalAssetExists(PackagePath) ? LoadObject<UStaticMesh>(nullptr, ObjectPath) : nullptr;
	};
	auto LoadOptionalAnimation = [&OptionalAssetExists](const TCHAR* ObjectPath, const TCHAR* PackagePath)
	{
		return OptionalAssetExists(PackagePath) ? LoadObject<UAnimSequence>(nullptr, ObjectPath) : nullptr;
	};

	USkeletalMesh* ProductionBatterMesh = LoadOptionalSkeletalMesh(TEXT("/Game/Daesseuyo/Art/Characters/Batter/SK_Batter.SK_Batter"), TEXT("/Game/Daesseuyo/Art/Characters/Batter/SK_Batter"));
	USkeletalMesh* ProductionPitcherMesh = LoadOptionalSkeletalMesh(TEXT("/Game/Daesseuyo/Art/Characters/Pitcher/SK_Pitcher.SK_Pitcher"), TEXT("/Game/Daesseuyo/Art/Characters/Pitcher/SK_Pitcher"));
	USkeletalMesh* ProductionCatcherMesh = LoadOptionalSkeletalMesh(TEXT("/Game/Daesseuyo/Art/Characters/Catcher/SK_Catcher.SK_Catcher"), TEXT("/Game/Daesseuyo/Art/Characters/Catcher/SK_Catcher"));
	UStaticMesh* ProductionBatMesh = LoadOptionalStaticMesh(TEXT("/Game/Daesseuyo/Art/Equipment/Bat/SM_WoodBat.SM_WoodBat"), TEXT("/Game/Daesseuyo/Art/Equipment/Bat/SM_WoodBat"));
	UStaticMesh* ProductionBallMesh = LoadOptionalStaticMesh(TEXT("/Game/Daesseuyo/Art/Equipment/Ball/SM_Baseball.SM_Baseball"), TEXT("/Game/Daesseuyo/Art/Equipment/Ball/SM_Baseball"));
	UStaticMesh* ProductionMittMesh = LoadOptionalStaticMesh(TEXT("/Game/Daesseuyo/Art/Equipment/Mitt/SM_CatcherMitt.SM_CatcherMitt"), TEXT("/Game/Daesseuyo/Art/Equipment/Mitt/SM_CatcherMitt"));
	UAnimSequence* ProductionIdleAnim = LoadOptionalAnimation(TEXT("/Game/Daesseuyo/Animation/Baseball/Batter/AM_Batter_Idle.AM_Batter_Idle"), TEXT("/Game/Daesseuyo/Animation/Baseball/Batter/AM_Batter_Idle"));
	UAnimSequence* ProductionSwingAnim = LoadOptionalAnimation(TEXT("/Game/Daesseuyo/Animation/Baseball/Batter/AM_Batter_Swing_Hit.AM_Batter_Swing_Hit"), TEXT("/Game/Daesseuyo/Animation/Baseball/Batter/AM_Batter_Swing_Hit"));
	UAnimSequence* ProductionThrowAnim = LoadOptionalAnimation(TEXT("/Game/Daesseuyo/Animation/Baseball/Pitcher/AM_Pitcher_Throw_FourSeam.AM_Pitcher_Throw_FourSeam"), TEXT("/Game/Daesseuyo/Animation/Baseball/Pitcher/AM_Pitcher_Throw_FourSeam"));

	if (ProductionBatterMesh)
	{
		BatterMesh->SetSkeletalMesh(ProductionBatterMesh);
	}
	if (ProductionPitcherMesh)
	{
		PitcherMesh->SetSkeletalMesh(ProductionPitcherMesh);
	}
	if (ProductionCatcherMesh)
	{
		CatcherMesh->SetSkeletalMesh(ProductionCatcherMesh);
	}
	if (ProductionBatMesh)
	{
		BatMesh->SetStaticMesh(ProductionBatMesh);
	}
	if (ProductionBallMesh)
	{
		BallMesh->SetStaticMesh(ProductionBallMesh);
	}
	if (ProductionMittMesh)
	{
		PitcherGloveMesh->SetStaticMesh(ProductionMittMesh);
		CatcherMittMesh->SetStaticMesh(ProductionMittMesh);
	}
	if (ProductionIdleAnim)
	{
		IdleAnimation = ProductionIdleAnim;
	}
	if (ProductionSwingAnim)
	{
		BatterSwingAnimation = ProductionSwingAnim;
	}
	if (ProductionThrowAnim)
	{
		PitcherThrowAnimation = ProductionThrowAnim;
	}
	bUsingProductionOneAtBatAssets =
		ProductionBatterMesh &&
		ProductionPitcherMesh &&
		ProductionCatcherMesh &&
		ProductionBatMesh &&
		ProductionBallMesh &&
		ProductionMittMesh &&
		ProductionSwingAnim &&
		ProductionThrowAnim;

	FieldPlane->SetRelativeLocation(FVector(3600.0f, 0.0f, -3.0f));
	FieldPlane->SetRelativeScale3D(FVector(105.0f, 74.0f, 1.0f));

	InfieldClay->SetRelativeLocation(FVector(720.0f, 0.0f, -1.5f));
	InfieldClay->SetRelativeRotation(FRotator(0.0f, 45.0f, 0.0f));
	InfieldClay->SetRelativeScale3D(FVector(10.5f, 10.5f, 1.0f));

	MoundMesh->SetRelativeLocation(FVector(1800.0f, 0.0f, 2.0f));
	MoundMesh->SetRelativeScale3D(FVector(2.6f, 2.6f, 0.14f));

	PlateMesh->SetRelativeLocation(FVector(0.0f, 0.0f, 2.0f));
	PlateMesh->SetRelativeScale3D(FVector(0.42f, 0.42f, 0.035f));

	BallMesh->SetWorldScale3D(FVector(0.16f));
	AimMesh->SetWorldScale3D(FVector(0.18f));
	BatterMarker->SetRelativeLocation(FVector(-105.0f, -110.0f, 88.0f));
	BatterMarker->SetRelativeScale3D(FVector(0.55f, 0.55f, 1.75f));
	BatterMarker->SetHiddenInGame(true);
	PitcherMarker->SetRelativeLocation(FVector(1800.0f, 0.0f, 92.0f));
	PitcherMarker->SetRelativeScale3D(FVector(0.5f, 0.5f, 1.8f));
	PitcherMarker->SetHiddenInGame(true);

	StadiumBackdropPlane->SetRelativeLocation(FVector(6700.0f, 0.0f, 650.0f));
	StadiumBackdropPlane->SetRelativeRotation(FRotator(0.0f, -90.0f, 0.0f));
	StadiumBackdropPlane->SetRelativeScale3D(FVector(17.0f, 9.6f, 1.0f));
	StadiumBackdropPlaneReverse->SetRelativeLocation(FVector(6698.0f, 0.0f, 650.0f));
	StadiumBackdropPlaneReverse->SetRelativeRotation(FRotator(0.0f, 90.0f, 0.0f));
	StadiumBackdropPlaneReverse->SetRelativeScale3D(FVector(17.0f, 9.6f, 1.0f));

	if (StadiumConcreteMeshes.Num() >= 7)
	{
		StadiumConcreteMeshes[0]->SetRelativeLocation(FVector(4700.0f, -1900.0f, 150.0f));
		StadiumConcreteMeshes[0]->SetRelativeRotation(FRotator(0.0f, 14.0f, 0.0f));
		StadiumConcreteMeshes[0]->SetRelativeScale3D(FVector(18.0f, 2.3f, 1.15f));
		StadiumConcreteMeshes[1]->SetRelativeLocation(FVector(4700.0f, 1900.0f, 150.0f));
		StadiumConcreteMeshes[1]->SetRelativeRotation(FRotator(0.0f, -14.0f, 0.0f));
		StadiumConcreteMeshes[1]->SetRelativeScale3D(FVector(18.0f, 2.3f, 1.15f));
		StadiumConcreteMeshes[2]->SetRelativeLocation(FVector(6200.0f, 0.0f, 190.0f));
		StadiumConcreteMeshes[2]->SetRelativeScale3D(FVector(1.0f, 18.0f, 1.35f));
		StadiumConcreteMeshes[3]->SetRelativeLocation(FVector(5200.0f, -2360.0f, 330.0f));
		StadiumConcreteMeshes[3]->SetRelativeRotation(FRotator(0.0f, 11.0f, 0.0f));
		StadiumConcreteMeshes[3]->SetRelativeScale3D(FVector(16.0f, 1.15f, 1.1f));
		StadiumConcreteMeshes[4]->SetRelativeLocation(FVector(5200.0f, 2360.0f, 330.0f));
		StadiumConcreteMeshes[4]->SetRelativeRotation(FRotator(0.0f, -11.0f, 0.0f));
		StadiumConcreteMeshes[4]->SetRelativeScale3D(FVector(16.0f, 1.15f, 1.1f));
		StadiumConcreteMeshes[5]->SetRelativeLocation(FVector(4100.0f, -2550.0f, 640.0f));
		StadiumConcreteMeshes[5]->SetRelativeScale3D(FVector(0.45f, 0.45f, 5.5f));
		StadiumConcreteMeshes[6]->SetRelativeLocation(FVector(4100.0f, 2550.0f, 640.0f));
		StadiumConcreteMeshes[6]->SetRelativeScale3D(FVector(0.45f, 0.45f, 5.5f));
	}

	if (StadiumDarkMeshes.Num() >= 3)
	{
		StadiumDarkMeshes[0]->SetRelativeLocation(FVector(1160.0f, -830.0f, 70.0f));
		StadiumDarkMeshes[0]->SetRelativeScale3D(FVector(5.1f, 0.28f, 0.78f));
		StadiumDarkMeshes[1]->SetRelativeLocation(FVector(1160.0f, 830.0f, 70.0f));
		StadiumDarkMeshes[1]->SetRelativeScale3D(FVector(5.1f, 0.28f, 0.78f));
		StadiumDarkMeshes[2]->SetRelativeLocation(FVector(6180.0f, 0.0f, 355.0f));
		StadiumDarkMeshes[2]->SetRelativeScale3D(FVector(0.18f, 5.1f, 1.75f));
	}

	if (StadiumLightMeshes.Num() >= 2)
	{
		StadiumLightMeshes[0]->SetRelativeLocation(FVector(4050.0f, -2550.0f, 1220.0f));
		StadiumLightMeshes[0]->SetRelativeRotation(FRotator(-10.0f, 10.0f, 0.0f));
		StadiumLightMeshes[0]->SetRelativeScale3D(FVector(0.16f, 2.0f, 0.66f));
		StadiumLightMeshes[1]->SetRelativeLocation(FVector(4050.0f, 2550.0f, 1220.0f));
		StadiumLightMeshes[1]->SetRelativeRotation(FRotator(-10.0f, -10.0f, 0.0f));
		StadiumLightMeshes[1]->SetRelativeScale3D(FVector(0.16f, 2.0f, 0.66f));
	}

	if (StadiumAdMeshes.Num() >= 3)
	{
		StadiumAdMeshes[0]->SetRelativeLocation(FVector(3420.0f, -1120.0f, 178.0f));
		StadiumAdMeshes[0]->SetRelativeRotation(FRotator(0.0f, 9.0f, 0.0f));
		StadiumAdMeshes[0]->SetRelativeScale3D(FVector(0.08f, 3.2f, 0.58f));
		StadiumAdMeshes[1]->SetRelativeLocation(FVector(3420.0f, 1120.0f, 178.0f));
		StadiumAdMeshes[1]->SetRelativeRotation(FRotator(0.0f, -9.0f, 0.0f));
		StadiumAdMeshes[1]->SetRelativeScale3D(FVector(0.08f, 3.2f, 0.58f));
		StadiumAdMeshes[2]->SetRelativeLocation(FVector(1860.0f, 0.0f, 215.0f));
		StadiumAdMeshes[2]->SetRelativeScale3D(FVector(0.06f, 8.0f, 0.42f));
	}

	if (StadiumCrowdMeshes.Num() >= 3)
	{
		StadiumCrowdMeshes[0]->SetRelativeLocation(FVector(4710.0f, -1900.0f, 238.0f));
		StadiumCrowdMeshes[0]->SetRelativeRotation(FRotator(0.0f, 14.0f, 0.0f));
		StadiumCrowdMeshes[0]->SetRelativeScale3D(FVector(17.6f, 2.36f, 0.1f));
		StadiumCrowdMeshes[1]->SetRelativeLocation(FVector(4710.0f, 1900.0f, 238.0f));
		StadiumCrowdMeshes[1]->SetRelativeRotation(FRotator(0.0f, -14.0f, 0.0f));
		StadiumCrowdMeshes[1]->SetRelativeScale3D(FVector(17.6f, 2.36f, 0.1f));
		StadiumCrowdMeshes[2]->SetRelativeLocation(FVector(6190.0f, 0.0f, 293.0f));
		StadiumCrowdMeshes[2]->SetRelativeScale3D(FVector(0.16f, 17.5f, 0.1f));
	}

	BatterMesh->SetRelativeLocation(FVector(-170.0f, -245.0f, 3.0f));
	BatterMesh->SetRelativeRotation(FRotator(0.0f, 42.0f, 0.0f));
	BatterMesh->SetRelativeScale3D(FVector(0.66f));

	PitcherMesh->SetRelativeLocation(FVector(1800.0f, 0.0f, 8.0f));
	PitcherMesh->SetRelativeRotation(FRotator(0.0f, 180.0f, 0.0f));
	PitcherMesh->SetRelativeScale3D(FVector(0.82f));

	CatcherMesh->SetRelativeLocation(FVector(-235.0f, 86.0f, 3.0f));
	CatcherMesh->SetRelativeRotation(FRotator(0.0f, 0.0f, 0.0f));
	CatcherMesh->SetRelativeScale3D(FVector(0.5f));
	CatcherMesh->SetHiddenInGame(false);

	BatMesh->SetRelativeLocation(FVector(-248.0f, -192.0f, 126.0f));
	BatMesh->SetRelativeRotation(FRotator(67.0f, -24.0f, 18.0f));
	BatMesh->SetRelativeScale3D(FVector(0.028f, 0.028f, 1.03f));

	PitcherGloveMesh->SetRelativeLocation(FVector(1738.0f, -26.0f, 128.0f));
	PitcherGloveMesh->SetRelativeScale3D(FVector(0.18f, 0.24f, 0.16f));

	CatcherMittMesh->SetRelativeLocation(FVector(-34.0f, 0.0f, 118.0f));
	CatcherMittMesh->SetRelativeScale3D(FVector(0.16f, 0.22f, 0.15f));

	BatterHelmetMesh->SetRelativeLocation(FVector(-176.0f, -247.0f, 124.0f));
	BatterHelmetMesh->SetRelativeScale3D(FVector(0.18f, 0.2f, 0.11f));
	PitcherCapMesh->SetRelativeLocation(FVector(1800.0f, 0.0f, 170.0f));
	PitcherCapMesh->SetRelativeScale3D(FVector(0.19f, 0.2f, 0.08f));
	CatcherMaskMesh->SetRelativeLocation(FVector(-215.0f, 80.0f, 103.0f));
	CatcherMaskMesh->SetRelativeScale3D(FVector(0.15f, 0.12f, 0.18f));

	const float ZoneMidZ = (FBaseballPhysics::StrikeBottom + FBaseballPhysics::StrikeTop) * 0.5f;
	const float ZoneHeight = FBaseballPhysics::StrikeTop - FBaseballPhysics::StrikeBottom;
	const float ZoneWidth = FBaseballPhysics::StrikeHalfWidth * 2.0f;
	StrikeZoneTop->SetRelativeLocation(FVector(FBaseballPhysics::PlateX, 0.0f, FBaseballPhysics::StrikeTop));
	StrikeZoneTop->SetRelativeScale3D(FVector(0.03f, ZoneWidth / 100.0f, 0.025f));
	StrikeZoneBottom->SetRelativeLocation(FVector(FBaseballPhysics::PlateX, 0.0f, FBaseballPhysics::StrikeBottom));
	StrikeZoneBottom->SetRelativeScale3D(FVector(0.03f, ZoneWidth / 100.0f, 0.025f));
	StrikeZoneLeft->SetRelativeLocation(FVector(FBaseballPhysics::PlateX, -FBaseballPhysics::StrikeHalfWidth, ZoneMidZ));
	StrikeZoneLeft->SetRelativeScale3D(FVector(0.03f, 0.025f, ZoneHeight / 100.0f));
	StrikeZoneRight->SetRelativeLocation(FVector(FBaseballPhysics::PlateX, FBaseballPhysics::StrikeHalfWidth, ZoneMidZ));
	StrikeZoneRight->SetRelativeScale3D(FVector(0.03f, 0.025f, ZoneHeight / 100.0f));

	FoulLineLeft->SetRelativeLocation(FVector(1400.0f, -245.0f, 3.0f));
	FoulLineLeft->SetRelativeRotation(FRotator(0.0f, 10.0f, 0.0f));
	FoulLineLeft->SetRelativeScale3D(FVector(28.0f, 0.018f, 0.018f));
	FoulLineRight->SetRelativeLocation(FVector(1400.0f, 245.0f, 3.0f));
	FoulLineRight->SetRelativeRotation(FRotator(0.0f, -10.0f, 0.0f));
	FoulLineRight->SetRelativeScale3D(FVector(28.0f, 0.018f, 0.018f));

	FirstBaseMesh->SetRelativeLocation(FVector(840.0f, 840.0f, 5.0f));
	FirstBaseMesh->SetRelativeRotation(FRotator(0.0f, 45.0f, 0.0f));
	FirstBaseMesh->SetRelativeScale3D(FVector(0.34f, 0.34f, 0.045f));

	SecondBaseMesh->SetRelativeLocation(FVector(1680.0f, 0.0f, 5.0f));
	SecondBaseMesh->SetRelativeRotation(FRotator(0.0f, 45.0f, 0.0f));
	SecondBaseMesh->SetRelativeScale3D(FVector(0.34f, 0.34f, 0.045f));

	ThirdBaseMesh->SetRelativeLocation(FVector(840.0f, -840.0f, 5.0f));
	ThirdBaseMesh->SetRelativeRotation(FRotator(0.0f, 45.0f, 0.0f));
	ThirdBaseMesh->SetRelativeScale3D(FVector(0.34f, 0.34f, 0.045f));

	BatterBoxLeft->SetRelativeLocation(FVector(-30.0f, -126.0f, 4.0f));
	BatterBoxLeft->SetRelativeScale3D(FVector(1.2f, 0.018f, 0.025f));
	BatterBoxRight->SetRelativeLocation(FVector(-30.0f, 126.0f, 4.0f));
	BatterBoxRight->SetRelativeScale3D(FVector(1.2f, 0.018f, 0.025f));

	OutfieldWall->SetRelativeLocation(FVector(7600.0f, 0.0f, 135.0f));
	OutfieldWall->SetRelativeScale3D(FVector(0.12f, 36.0f, 2.7f));

	ScoreboardPanel->SetRelativeLocation(FVector(7420.0f, 0.0f, 480.0f));
	ScoreboardPanel->SetRelativeRotation(FRotator(0.0f, 180.0f, 0.0f));
	ScoreboardPanel->SetRelativeScale3D(FVector(0.16f, 5.4f, 1.5f));

	ScoreboardText->SetRelativeLocation(FVector(7408.0f, 0.0f, 485.0f));
	ScoreboardText->SetRelativeRotation(FRotator(0.0f, 180.0f, 0.0f));
	RibbonBoardText->SetRelativeLocation(FVector(1848.0f, 0.0f, 218.0f));
	RibbonBoardText->SetRelativeRotation(FRotator(0.0f, 180.0f, 0.0f));
}

void ADaesseuyoMvpPawn::BeginPlay()
{
	Super::BeginPlay();
	ApplyMvpMaterials();
	ApplyBackdropTexture();
	PlayIdlePresentation();
	SetCameraForBatterView();
	ConfigureController();
	ResetMvp();
}

void ADaesseuyoMvpPawn::PossessedBy(AController* NewController)
{
	Super::PossessedBy(NewController);
	ConfigureController();
}

void ADaesseuyoMvpPawn::Tick(float DeltaSeconds)
{
	Super::Tick(DeltaSeconds);

	if (Phase == EMvpPlayPhase::Ready)
	{
		if (bAtBatEnded || CountState.Outs >= 3 || CountState.HomeScore > CountState.AwayScore)
		{
			UpdateMeshPositions();
			UpdateCameraForPhase();
			ShowHud();
			return;
		}

		ReadyTimer -= DeltaSeconds;
		if (ReadyTimer <= 0.0f)
		{
			StartNextPitch();
		}
	}
	else if (Phase == EMvpPlayPhase::Pitching)
	{
		TickPitch(DeltaSeconds);
	}
	else if (Phase == EMvpPlayPhase::BattedBall)
	{
		TickBattedBall(DeltaSeconds);
	}
	else if (Phase == EMvpPlayPhase::Result)
	{
		ResultTimer -= DeltaSeconds;
		if (ResultTimer <= 0.0f)
		{
			Phase = EMvpPlayPhase::Ready;
			ReadyTimer = 0.85f;
			PlayIdlePresentation();
		}
	}

	UpdatePresentation(DeltaSeconds);
	UpdateMeshPositions();
	UpdateCameraForPhase();
	ShowHud();
}

void ADaesseuyoMvpPawn::SetupPlayerInputComponent(UInputComponent* PlayerInputComponent)
{
	Super::SetupPlayerInputComponent(PlayerInputComponent);
	PlayerInputComponent->BindAxis(TEXT("AimX"), this, &ADaesseuyoMvpPawn::MoveAimX);
	PlayerInputComponent->BindAxis(TEXT("AimY"), this, &ADaesseuyoMvpPawn::MoveAimY);
	PlayerInputComponent->BindAction(TEXT("Swing"), IE_Pressed, this, &ADaesseuyoMvpPawn::Swing);
	PlayerInputComponent->BindAction(TEXT("ResetMvp"), IE_Pressed, this, &ADaesseuyoMvpPawn::ResetMvp);
}

void ADaesseuyoMvpPawn::MoveAimX(float Value)
{
	if (FMath::IsNearlyZero(Value))
	{
		return;
	}

	AimPoint.Y = FMath::Clamp(AimPoint.Y + Value * AimSensitivity, -82.0f, 82.0f);
}

void ADaesseuyoMvpPawn::MoveAimY(float Value)
{
	if (FMath::IsNearlyZero(Value))
	{
		return;
	}

	AimPoint.Z = FMath::Clamp(AimPoint.Z + Value * AimSensitivity, 48.0f, 220.0f);
}

void ADaesseuyoMvpPawn::Swing()
{
	if (Phase == EMvpPlayPhase::Ready)
	{
		LastResult = TEXT("투수가 사인 교환 중입니다. 공이 보이면 Space/클릭으로 스윙하세요.");
		return;
	}

	if (Phase != EMvpPlayPhase::Pitching)
	{
		LastResult = TEXT("다음 투구를 기다리는 중입니다. R 키로 즉시 재시작할 수 있습니다.");
		return;
	}

	if (bSwingConsumed)
	{
		LastResult = TEXT("이미 스윙했습니다. 타구/판정 결과를 기다리는 중입니다.");
		return;
	}

	bSwingConsumed = true;
	PlayBatterSwingPresentation();

	const float PlateDistance = FMath::Abs(BallPosition.X - FBaseballPhysics::PlateX);
	const float TimingQuality = 1.0f - FMath::Clamp(PlateDistance / 180.0f, 0.0f, 1.0f);
	const float AimQuality = FBaseballPhysics::EstimateContactQuality(BallPosition, AimPoint);
	const float ContactQuality = TimingQuality * 0.58f + AimQuality * 0.42f;

	if (ContactQuality < 0.35f)
	{
		LastResult = FString::Printf(TEXT("스윙 판정: 타이밍 %.0f%% / 조준 %.0f%%"), TimingQuality * 100.0f, AimQuality * 100.0f);
		ResolveSwingMiss();
		return;
	}

	PutBallInPlay(ContactQuality);
}

void ADaesseuyoMvpPawn::ResetMvp()
{
	CountState = FBaseballCountState();
	Phase = EMvpPlayPhase::Ready;
	ReadyTimer = 1.0f;
	ResultTimer = 0.0f;
	PitchElapsed = 0.0f;
	PhysicsAccumulator = 0.0f;
	bSwingConsumed = false;
	bAtBatEnded = false;
	BallPosition = PitchStart;
	BallVelocity = FVector::ZeroVector;
	AimPoint = FVector(FBaseballPhysics::PlateX, 0.0f, 130.0f);
	LastResult = TEXT("대쓰요 : real BaseBall. 9회말 2아웃, 주자 2루, 한 점 차.");
	SwingVisualTimer = 0.0f;
	PitcherVisualTimer = 0.0f;
	PlayIdlePresentation();
	UpdateMeshPositions();
	UE_LOG(LogTemp, Display, TEXT("Daesseuyo MVP reset"));
}

void ADaesseuyoMvpPawn::StartNextPitch()
{
	CurrentPitch = MakeRandomPitch();
	PitchStart = FVector(1800.0f, FMath::FRandRange(-18.0f, 18.0f), FMath::FRandRange(158.0f, 188.0f));
	PitchTarget = FVector(
		FBaseballPhysics::PlateX,
		FMath::FRandRange(-68.0f, 68.0f),
		FMath::FRandRange(62.0f, 202.0f)
	);

	BallPosition = PitchStart;
	BallVelocity = FBaseballPhysics::SolveInitialVelocity(PitchStart, PitchTarget, CurrentPitch.FlightTime);
	Phase = EMvpPlayPhase::Pitching;
	PitchElapsed = 0.0f;
	PhysicsAccumulator = 0.0f;
	bSwingConsumed = false;

	LastResult = FString::Printf(TEXT("%s %.0fkm/h - MVP 슬로모션 투구. 존에 맞춰 Space/클릭."), *PitchName(CurrentPitch.Type), CurrentPitch.SpeedKph);
	PlayPitcherThrowPresentation();
	UE_LOG(LogTemp, Display, TEXT("Daesseuyo pitch: %s %.0f km/h target Y %.1f Z %.1f"), *PitchName(CurrentPitch.Type), CurrentPitch.SpeedKph, PitchTarget.Y, PitchTarget.Z);
}

void ADaesseuyoMvpPawn::TickPitch(float DeltaSeconds)
{
	PhysicsAccumulator += DeltaSeconds;

	for (int32 StepIndex = 0; StepIndex < 24 && PhysicsAccumulator >= FBaseballPhysics::SimTick; ++StepIndex)
	{
		const FVector PreviousPosition = BallPosition;
		FBaseballPhysics::StepPitch(BallPosition, BallVelocity, CurrentPitch, FBaseballPhysics::SimTick);
		PitchElapsed += FBaseballPhysics::SimTick;
		PhysicsAccumulator -= FBaseballPhysics::SimTick;

		const bool bCrossedPlate = PreviousPosition.X > FBaseballPhysics::PlateX && BallPosition.X <= FBaseballPhysics::PlateX;
		if (bCrossedPlate && !bSwingConsumed)
		{
			ResolveTakenPitch();
			return;
		}

		if (BallPosition.X < -120.0f || PitchElapsed > 1.4f)
		{
			if (!bSwingConsumed)
			{
				ResolveTakenPitch();
			}
			return;
		}
	}
}

void ADaesseuyoMvpPawn::TickBattedBall(float DeltaSeconds)
{
	PhysicsAccumulator += DeltaSeconds;

	for (int32 StepIndex = 0; StepIndex < 24 && PhysicsAccumulator >= FBaseballPhysics::SimTick; ++StepIndex)
	{
		FBaseballPhysics::StepBattedBall(BallPosition, BallVelocity, FBaseballPhysics::SimTick);
		PhysicsAccumulator -= FBaseballPhysics::SimTick;

		if (BallPosition.X > 8200.0f || (BallPosition.Z <= 4.0f && BallVelocity.Size() < 820.0f))
		{
			ResolveBattedBall();
			return;
		}
	}
}

void ADaesseuyoMvpPawn::ResolveTakenPitch()
{
	if (FBaseballPhysics::IsStrikeLocation(BallPosition))
	{
		AddStrike(TEXT("루킹 스트라이크"));
	}
	else
	{
		AddBall();
	}
}

void ADaesseuyoMvpPawn::ResolveSwingMiss()
{
	AddStrike(TEXT("헛스윙"));
}

void ADaesseuyoMvpPawn::ResolveBattedBall()
{
	const float CarryMeters = FMath::Max(0.0f, BallPosition.X) / 100.0f;

	if (CarryMeters >= 105.0f)
	{
		CountState.HomeScore += 2;
		LastResult = TEXT("대쓰요? 넘어갑니다. 역전 끝내기 투런.");
	}
	else if (CarryMeters >= 45.0f)
	{
		CountState.HomeScore += 1;
		LastResult = FString::Printf(TEXT("중견수 앞 동점 적시타. 비거리 %.1fm."), CarryMeters);
	}
	else
	{
		CountState.Outs += 1;
		LastResult = FString::Printf(TEXT("내야 땅볼. 비거리 %.1fm."), CarryMeters);
	}

	if (CountState.HomeScore > CountState.AwayScore)
	{
		LastResult = TEXT("끝내기. 대쓰요 : real BaseBall.");
	}
	else if (CountState.Outs >= 3)
	{
		LastResult = TEXT("경기 종료. R 키로 MVP를 다시 시작.");
	}
	else if (CountState.HomeScore == CountState.AwayScore)
	{
		LastResult = TEXT("동점 적시타. 한 타석 vertical slice 종료. R 키로 다시 시작.");
	}

	CountState.ResetCount();
	bAtBatEnded = true;
	Phase = EMvpPlayPhase::Result;
	ResultTimer = 2.4f;
}

void ADaesseuyoMvpPawn::AddStrike(const FString& Reason)
{
	CountState.Strikes += 1;
	LastResult = FString::Printf(TEXT("%s. %s"), *Reason, *PitchName(CurrentPitch.Type));

	if (CountState.Strikes >= 3)
	{
		CountState.Outs += 1;
		CountState.ResetCount();
		bAtBatEnded = true;
		LastResult = TEXT("삼진. 한 타석 종료. R 키로 다시 시작.");
	}

	Phase = EMvpPlayPhase::Result;
	ResultTimer = 1.25f;
}

void ADaesseuyoMvpPawn::AddBall()
{
	CountState.Balls += 1;
	LastResult = FString::Printf(TEXT("볼. %s가 존을 벗어났습니다."), *PitchName(CurrentPitch.Type));

	if (CountState.Balls >= 4)
	{
		CountState.ResetCount();
		bAtBatEnded = true;
		LastResult = TEXT("볼넷. 한 타석 종료. R 키로 다시 시작.");
	}

	Phase = EMvpPlayPhase::Result;
	ResultTimer = 1.15f;
}

void ADaesseuyoMvpPawn::PutBallInPlay(float ContactQuality)
{
	BallVelocity = FBaseballPhysics::ComputeBattedVelocity(BallVelocity, BallPosition, AimPoint, ContactQuality, ContactQuality);
	Phase = EMvpPlayPhase::BattedBall;
	PhysicsAccumulator = 0.0f;
	LastResult = FString::Printf(TEXT("인플레이. 임팩트 품질 %.0f%%"), ContactQuality * 100.0f);
	UE_LOG(LogTemp, Display, TEXT("Daesseuyo contact quality %.2f"), ContactQuality);
}

FBaseballPitchSpec ADaesseuyoMvpPawn::MakeRandomPitch() const
{
	FBaseballPitchSpec Spec;
	const int32 PitchRoll = FMath::RandRange(0, 4);
	Spec.Type = static_cast<EPitchType>(PitchRoll);

	switch (Spec.Type)
	{
	case EPitchType::TwoSeam:
		Spec.SpeedKph = FMath::FRandRange(139.0f, 146.0f);
		Spec.FlightTime = 1.08f;
		Spec.SpinAxis = FVector(0.2f, 0.85f, 0.35f);
		Spec.SpinRpm = 2100.0f;
		Spec.MagnusScale = 0.75f;
		break;
	case EPitchType::Slider:
		Spec.SpeedKph = FMath::FRandRange(130.0f, 137.0f);
		Spec.FlightTime = 1.14f;
		Spec.SpinAxis = FVector(0.1f, -0.9f, 0.2f);
		Spec.SpinRpm = 2450.0f;
		Spec.MagnusScale = 1.2f;
		break;
	case EPitchType::Curve:
		Spec.SpeedKph = FMath::FRandRange(116.0f, 124.0f);
		Spec.FlightTime = 1.24f;
		Spec.SpinAxis = FVector(0.0f, -0.25f, -1.0f);
		Spec.SpinRpm = 2650.0f;
		Spec.MagnusScale = 1.35f;
		break;
	case EPitchType::Splitter:
		Spec.SpeedKph = FMath::FRandRange(134.0f, 140.0f);
		Spec.FlightTime = 1.17f;
		Spec.SpinAxis = FVector(0.05f, 0.2f, -0.65f);
		Spec.SpinRpm = 1350.0f;
		Spec.MagnusScale = 1.05f;
		break;
	case EPitchType::FourSeam:
	default:
		Spec.SpeedKph = FMath::FRandRange(144.0f, 151.0f);
		Spec.FlightTime = 1.05f;
		Spec.SpinAxis = FVector(0.0f, 0.0f, 1.0f);
		Spec.SpinRpm = 2350.0f;
		Spec.MagnusScale = 0.9f;
		break;
	}

	return Spec;
}

FString ADaesseuyoMvpPawn::PitchName(EPitchType Type) const
{
	switch (Type)
	{
	case EPitchType::TwoSeam:
		return TEXT("투심");
	case EPitchType::Slider:
		return TEXT("슬라이더");
	case EPitchType::Curve:
		return TEXT("커브");
	case EPitchType::Splitter:
		return TEXT("스플리터");
	case EPitchType::FourSeam:
	default:
		return TEXT("직구");
	}
}

FString ADaesseuyoMvpPawn::PhaseLabel() const
{
	switch (Phase)
	{
	case EMvpPlayPhase::Ready:
		return TEXT("대기");
	case EMvpPlayPhase::Pitching:
		return TEXT("투구 중");
	case EMvpPlayPhase::BattedBall:
		return TEXT("인플레이");
	case EMvpPlayPhase::Result:
	default:
		return TEXT("판정");
	}
}

void ADaesseuyoMvpPawn::ApplyTint(UStaticMeshComponent* Mesh, const FLinearColor& Color) const
{
	if (!Mesh)
	{
		return;
	}

	if (BaseShapeMaterial)
	{
		Mesh->SetMaterial(0, BaseShapeMaterial);
	}

	UMaterialInstanceDynamic* Material = Mesh->CreateAndSetMaterialInstanceDynamic(0);
	if (Material)
	{
		Material->SetVectorParameterValue(TEXT("Color"), Color);
	}
}

void ADaesseuyoMvpPawn::ApplySkeletalTint(USkeletalMeshComponent* Mesh, const FLinearColor& Color) const
{
	if (!Mesh)
	{
		return;
	}

	const int32 MaterialCount = FMath::Max(1, Mesh->GetNumMaterials());
	for (int32 MaterialIndex = 0; MaterialIndex < MaterialCount; ++MaterialIndex)
	{
		UMaterialInstanceDynamic* Material = Mesh->CreateDynamicMaterialInstance(MaterialIndex);
		if (Material)
		{
			Material->SetVectorParameterValue(TEXT("Color"), Color);
			Material->SetVectorParameterValue(TEXT("BaseColor"), Color);
		}
	}
}

UTexture2D* ADaesseuyoMvpPawn::LoadTextureFromProjectFile(const FString& RelativePath) const
{
	const FString FullPath = FPaths::ConvertRelativePathToFull(FPaths::ProjectDir() / RelativePath);

	TArray<uint8> CompressedData;
	if (!FFileHelper::LoadFileToArray(CompressedData, *FullPath))
	{
		UE_LOG(LogTemp, Warning, TEXT("Daesseuyo could not load texture file: %s"), *FullPath);
		return nullptr;
	}

	IImageWrapperModule& ImageWrapperModule = FModuleManager::LoadModuleChecked<IImageWrapperModule>(TEXT("ImageWrapper"));
	const EImageFormat DetectedFormat = ImageWrapperModule.DetectImageFormat(CompressedData.GetData(), CompressedData.Num());
	if (DetectedFormat == EImageFormat::Invalid)
	{
		UE_LOG(LogTemp, Warning, TEXT("Daesseuyo texture format is invalid: %s"), *FullPath);
		return nullptr;
	}

	const TSharedPtr<IImageWrapper> ImageWrapper = ImageWrapperModule.CreateImageWrapper(DetectedFormat);
	if (!ImageWrapper.IsValid() || !ImageWrapper->SetCompressed(CompressedData.GetData(), CompressedData.Num()))
	{
		UE_LOG(LogTemp, Warning, TEXT("Daesseuyo could not decode texture: %s"), *FullPath);
		return nullptr;
	}

	TArray<uint8> RawData;
	if (!ImageWrapper->GetRaw(ERGBFormat::BGRA, 8, RawData))
	{
		UE_LOG(LogTemp, Warning, TEXT("Daesseuyo could not convert texture pixels: %s"), *FullPath);
		return nullptr;
	}

	UTexture2D* Texture = UTexture2D::CreateTransient(ImageWrapper->GetWidth(), ImageWrapper->GetHeight(), PF_B8G8R8A8);
	if (!Texture)
	{
		return nullptr;
	}

	Texture->SRGB = true;
	void* TextureData = Texture->GetPlatformData()->Mips[0].BulkData.Lock(LOCK_READ_WRITE);
	FMemory::Memcpy(TextureData, RawData.GetData(), RawData.Num());
	Texture->GetPlatformData()->Mips[0].BulkData.Unlock();
	Texture->UpdateResource();
	return Texture;
}

void ADaesseuyoMvpPawn::ApplyBackdropTexture()
{
	if (!TexturedMaterial || !StadiumBackdropPlane)
	{
		return;
	}

	StadiumBackdropTexture = LoadTextureFromProjectFile(TEXT("Content/Daesseuyo/Generated/Images/stadium_batting_view.png"));
	if (!StadiumBackdropTexture)
	{
		return;
	}

	UStaticMeshComponent* BackdropMeshes[] = { StadiumBackdropPlane, StadiumBackdropPlaneReverse };
	for (UStaticMeshComponent* Mesh : BackdropMeshes)
	{
		if (!Mesh)
		{
			continue;
		}

		Mesh->SetMaterial(0, TexturedMaterial);
		UMaterialInstanceDynamic* Material = Mesh->CreateAndSetMaterialInstanceDynamic(0);
		if (Material)
		{
			Material->SetTextureParameterValue(TEXT("Texture"), StadiumBackdropTexture);
		}
	}
}

void ADaesseuyoMvpPawn::ApplyMvpMaterials() const
{
	ApplyTint(StadiumBackdropPlane, FLinearColor(0.02f, 0.025f, 0.035f, 1.0f));
	ApplyTint(StadiumBackdropPlaneReverse, FLinearColor(0.02f, 0.025f, 0.035f, 1.0f));
	for (UStaticMeshComponent* Mesh : StadiumConcreteMeshes)
	{
		ApplyTint(Mesh, FLinearColor(0.12f, 0.15f, 0.18f, 1.0f));
	}
	for (UStaticMeshComponent* Mesh : StadiumDarkMeshes)
	{
		ApplyTint(Mesh, FLinearColor(0.018f, 0.024f, 0.03f, 1.0f));
	}
	for (UStaticMeshComponent* Mesh : StadiumLightMeshes)
	{
		ApplyTint(Mesh, FLinearColor(8.0f, 7.4f, 6.2f, 1.0f));
	}
	for (UStaticMeshComponent* Mesh : StadiumAdMeshes)
	{
		ApplyTint(Mesh, FLinearColor(0.02f, 0.13f, 0.36f, 1.0f));
	}
	for (UStaticMeshComponent* Mesh : StadiumCrowdMeshes)
	{
		ApplyTint(Mesh, FLinearColor(0.66f, 0.68f, 0.62f, 1.0f));
	}
	ApplyTint(FieldPlane, FLinearColor(0.055f, 0.26f, 0.12f, 1.0f));
	ApplyTint(InfieldClay, FLinearColor(0.47f, 0.24f, 0.105f, 1.0f));
	ApplyTint(MoundMesh, FLinearColor(0.55f, 0.31f, 0.13f, 1.0f));
	ApplyTint(PlateMesh, FLinearColor(0.96f, 0.93f, 0.84f, 1.0f));
	ApplyTint(BallMesh, FLinearColor(0.98f, 0.97f, 0.91f, 1.0f));
	ApplyTint(AimMesh, FLinearColor(1.0f, 0.82f, 0.12f, 1.0f));
	ApplyTint(BatterMarker, FLinearColor(0.03f, 0.18f, 0.95f, 1.0f));
	ApplyTint(PitcherMarker, FLinearColor(0.9f, 0.14f, 0.1f, 1.0f));
	ApplySkeletalTint(BatterMesh, FLinearColor(0.02f, 0.14f, 0.72f, 1.0f));
	ApplySkeletalTint(PitcherMesh, FLinearColor(0.82f, 0.08f, 0.06f, 1.0f));
	ApplySkeletalTint(CatcherMesh, FLinearColor(0.09f, 0.09f, 0.11f, 1.0f));
	ApplyTint(BatMesh, FLinearColor(0.48f, 0.24f, 0.09f, 1.0f));
	ApplyTint(PitcherGloveMesh, FLinearColor(0.24f, 0.11f, 0.045f, 1.0f));
	ApplyTint(CatcherMittMesh, FLinearColor(0.24f, 0.11f, 0.045f, 1.0f));
	ApplyTint(BatterHelmetMesh, FLinearColor(0.0f, 0.07f, 0.42f, 1.0f));
	ApplyTint(PitcherCapMesh, FLinearColor(0.72f, 0.02f, 0.02f, 1.0f));
	ApplyTint(CatcherMaskMesh, FLinearColor(0.01f, 0.012f, 0.016f, 1.0f));
	ApplyTint(StrikeZoneTop, FLinearColor(1.0f, 1.0f, 1.0f, 1.0f));
	ApplyTint(StrikeZoneBottom, FLinearColor(1.0f, 1.0f, 1.0f, 1.0f));
	ApplyTint(StrikeZoneLeft, FLinearColor(1.0f, 1.0f, 1.0f, 1.0f));
	ApplyTint(StrikeZoneRight, FLinearColor(1.0f, 1.0f, 1.0f, 1.0f));
	ApplyTint(FoulLineLeft, FLinearColor(0.95f, 0.92f, 0.82f, 1.0f));
	ApplyTint(FoulLineRight, FLinearColor(0.95f, 0.92f, 0.82f, 1.0f));
	ApplyTint(FirstBaseMesh, FLinearColor(0.95f, 0.92f, 0.82f, 1.0f));
	ApplyTint(SecondBaseMesh, FLinearColor(0.95f, 0.92f, 0.82f, 1.0f));
	ApplyTint(ThirdBaseMesh, FLinearColor(0.95f, 0.92f, 0.82f, 1.0f));
	ApplyTint(BatterBoxLeft, FLinearColor(0.95f, 0.92f, 0.82f, 1.0f));
	ApplyTint(BatterBoxRight, FLinearColor(0.95f, 0.92f, 0.82f, 1.0f));
	ApplyTint(OutfieldWall, FLinearColor(0.035f, 0.18f, 0.32f, 1.0f));
	ApplyTint(ScoreboardPanel, FLinearColor(0.015f, 0.02f, 0.025f, 1.0f));
}

void ADaesseuyoMvpPawn::ConfigureController() const
{
	APlayerController* PlayerController = Cast<APlayerController>(GetController());
	if (!PlayerController)
	{
		return;
	}

	PlayerController->bShowMouseCursor = false;
	FInputModeGameOnly InputMode;
	PlayerController->SetInputMode(InputMode);
}

void ADaesseuyoMvpPawn::PlayIdlePresentation() const
{
	if (IdleAnimation)
	{
		if (BatterMesh && BatterMesh->GetSkeletalMeshAsset())
		{
			BatterMesh->SetAnimationMode(EAnimationMode::AnimationSingleNode);
			BatterMesh->PlayAnimation(IdleAnimation, true);
		}
		if (PitcherMesh && PitcherMesh->GetSkeletalMeshAsset())
		{
			PitcherMesh->SetAnimationMode(EAnimationMode::AnimationSingleNode);
			PitcherMesh->PlayAnimation(IdleAnimation, true);
		}
		if (CatcherMesh && CatcherMesh->GetSkeletalMeshAsset())
		{
			CatcherMesh->SetAnimationMode(EAnimationMode::AnimationSingleNode);
			CatcherMesh->PlayAnimation(IdleAnimation, true);
		}
	}
}

void ADaesseuyoMvpPawn::PlayBatterSwingPresentation()
{
	SwingVisualTimer = 0.56f;
	if (BatterSwingAnimation && BatterMesh && BatterMesh->GetSkeletalMeshAsset())
	{
		BatterMesh->SetAnimationMode(EAnimationMode::AnimationSingleNode);
		BatterMesh->PlayAnimation(BatterSwingAnimation, false);
	}
}

void ADaesseuyoMvpPawn::PlayPitcherThrowPresentation()
{
	PitcherVisualTimer = 0.72f;
	if (PitcherThrowAnimation && PitcherMesh && PitcherMesh->GetSkeletalMeshAsset())
	{
		PitcherMesh->SetAnimationMode(EAnimationMode::AnimationSingleNode);
		PitcherMesh->PlayAnimation(PitcherThrowAnimation, false);
	}
}

void ADaesseuyoMvpPawn::UpdatePresentation(float DeltaSeconds)
{
	const bool bWasSwinging = SwingVisualTimer > 0.0f;
	const bool bWasPitcherThrowing = PitcherVisualTimer > 0.0f;
	SwingVisualTimer = FMath::Max(0.0f, SwingVisualTimer - DeltaSeconds);
	PitcherVisualTimer = FMath::Max(0.0f, PitcherVisualTimer - DeltaSeconds);

	if (BatMesh)
	{
		const FVector IdleLocation(-248.0f, -192.0f, 126.0f);
		const FVector ContactLocation(20.0f, -38.0f, 116.0f);
		const FVector FollowLocation(86.0f, 82.0f, 145.0f);
		const FRotator IdleRotation(67.0f, -24.0f, 18.0f);
		const FRotator ContactRotation(88.0f, 74.0f, -82.0f);
		const FRotator FollowRotation(44.0f, 146.0f, -34.0f);

		FVector BatLocation = IdleLocation;
		FQuat BatRotation = IdleRotation.Quaternion();

		if (SwingVisualTimer > 0.0f)
		{
			const float SwingAlpha = 1.0f - (SwingVisualTimer / 0.56f);
			const float SmoothedAlpha = FMath::InterpEaseInOut(0.0f, 1.0f, SwingAlpha, 2.2f);
			if (SmoothedAlpha < 0.68f)
			{
				const float ContactAlpha = SmoothedAlpha / 0.68f;
				BatLocation = FMath::Lerp(IdleLocation, ContactLocation, ContactAlpha);
				BatRotation = FQuat::Slerp(IdleRotation.Quaternion(), ContactRotation.Quaternion(), ContactAlpha);
			}
			else
			{
				const float FollowAlpha = (SmoothedAlpha - 0.68f) / 0.32f;
				BatLocation = FMath::Lerp(ContactLocation, FollowLocation, FollowAlpha);
				BatRotation = FQuat::Slerp(ContactRotation.Quaternion(), FollowRotation.Quaternion(), FollowAlpha);
			}
		}

		BatMesh->SetWorldLocation(BatLocation);
		BatMesh->SetWorldRotation(BatRotation);
	}

	if (BatterMesh)
	{
		const float SwingAlpha = SwingVisualTimer > 0.0f ? 1.0f - (SwingVisualTimer / 0.56f) : 0.0f;
		const float Twist = FMath::Sin(SwingAlpha * PI) * 24.0f;
		BatterMesh->SetWorldRotation(FRotator(0.0f, 42.0f + Twist, 0.0f));
		if (BatterHelmetMesh)
		{
			BatterHelmetMesh->SetWorldLocation(FVector(-176.0f, -247.0f, 124.0f));
			BatterHelmetMesh->SetWorldRotation(FRotator(0.0f, 42.0f + Twist, 0.0f));
		}
	}

	if (PitcherGloveMesh)
	{
		const float ThrowAlpha = PitcherVisualTimer > 0.0f ? 1.0f - (PitcherVisualTimer / 0.72f) : 0.0f;
		const float Lift = FMath::Sin(ThrowAlpha * PI);
		const FVector GloveLocation = FMath::Lerp(FVector(1738.0f, -26.0f, 128.0f), FVector(1790.0f, -6.0f, 178.0f), Lift);
		PitcherGloveMesh->SetWorldLocation(GloveLocation);
	}

	if (PitcherCapMesh)
	{
		PitcherCapMesh->SetWorldLocation(FVector(1800.0f, 0.0f, 170.0f));
		PitcherCapMesh->SetWorldRotation(FRotator(0.0f, 180.0f, 0.0f));
	}

	if (CatcherMittMesh)
	{
		const float TargetY = Phase == EMvpPlayPhase::Pitching ? PitchTarget.Y * 0.72f : 0.0f;
		const float TargetZ = Phase == EMvpPlayPhase::Pitching ? FMath::Clamp(PitchTarget.Z, 82.0f, 176.0f) : 116.0f;
		CatcherMittMesh->SetWorldLocation(FVector(-34.0f, TargetY, TargetZ));
	}

	if (ScoreboardText)
	{
		ScoreboardText->SetText(FText::FromString(FString::Printf(
			TEXT("DAESSEUYO\nSEO 3  BUS %d\nB%d S%d O%d"),
			CountState.HomeScore,
			CountState.Balls,
			CountState.Strikes,
			CountState.Outs
		)));
	}

	if ((bWasSwinging && SwingVisualTimer <= 0.0f) || (bWasPitcherThrowing && PitcherVisualTimer <= 0.0f && Phase != EMvpPlayPhase::Pitching))
	{
		PlayIdlePresentation();
	}
}

void ADaesseuyoMvpPawn::GetMvpHudLines(TArray<FString>& OutLines) const
{
	OutLines.Reset();
	OutLines.Add(TEXT("대쓰요 : real BaseBall"));
	OutLines.Add(FString::Printf(TEXT("서울 3  부산 %d | 9회말 2아웃, 주자 2루"), CountState.HomeScore));
	OutLines.Add(FString::Printf(TEXT("B:%d  S:%d  O:%d | %s"), CountState.Balls, CountState.Strikes, CountState.Outs, *PhaseLabel()));
	OutLines.Add(bUsingProductionOneAtBatAssets ? TEXT("모드: production one-at-bat asset set") : TEXT("모드: sample fallback assets"));
	OutLines.Add(TEXT("조작: Space/좌클릭 스윙 | 마우스/WASD/방향키 조준 | R 리셋"));
	OutLines.Add(FString::Printf(TEXT("조준 위치 Y %.0f / Z %.0f"), AimPoint.Y, AimPoint.Z));
	OutLines.Add(LastResult);
}

FVector ADaesseuyoMvpPawn::GetBallPosition() const
{
	return BallPosition;
}

FVector ADaesseuyoMvpPawn::GetAimPoint() const
{
	return AimPoint;
}

EMvpPlayPhase ADaesseuyoMvpPawn::GetPlayPhase() const
{
	return Phase;
}

bool ADaesseuyoMvpPawn::ShouldRenderBallForHud() const
{
	return Phase == EMvpPlayPhase::Pitching || Phase == EMvpPlayPhase::BattedBall;
}

void ADaesseuyoMvpPawn::UpdateMeshPositions() const
{
	if (BallMesh)
	{
		BallMesh->SetWorldLocation(BallPosition);
		BallMesh->SetVisibility(Phase == EMvpPlayPhase::Pitching || Phase == EMvpPlayPhase::BattedBall);
	}
	if (AimMesh)
	{
		AimMesh->SetWorldLocation(AimPoint);
		AimMesh->SetVisibility(Phase != EMvpPlayPhase::BattedBall);
	}
}

void ADaesseuyoMvpPawn::DrawMvpDebug() const
{
	const UWorld* World = GetWorld();
	if (!World)
	{
		return;
	}

	const FVector ZoneCenter(FBaseballPhysics::PlateX, 0.0f, (FBaseballPhysics::StrikeBottom + FBaseballPhysics::StrikeTop) * 0.5f);
	const FVector ZoneExtent(2.0f, FBaseballPhysics::StrikeHalfWidth, (FBaseballPhysics::StrikeTop - FBaseballPhysics::StrikeBottom) * 0.5f);
	DrawDebugBox(World, ZoneCenter, ZoneExtent, FColor::White, false, 0.0f, 0, 2.0f);

	DrawDebugSphere(World, AimPoint, 15.0f, 16, FColor::Yellow, false, 0.0f, 0, 1.4f);
	DrawDebugLine(World, FVector(0.0f, -330.0f, 1.0f), FVector(2100.0f, 0.0f, 1.0f), FColor::White, false, 0.0f, 0, 1.0f);
	DrawDebugLine(World, FVector(0.0f, 330.0f, 1.0f), FVector(2100.0f, 0.0f, 1.0f), FColor::White, false, 0.0f, 0, 1.0f);
	DrawDebugCircle(World, FVector(1800.0f, 0.0f, 2.5f), 135.0f, 48, FColor::Orange, false, 0.0f, 0, 1.2f, FVector::ForwardVector, FVector::RightVector, false);
}

void ADaesseuyoMvpPawn::ShowHud() const
{
	// The playable HUD is rendered by ADaesseuyoMvpHud. Keep this no-op so
	// engine warning/debug overlays do not bury the first playable screen.
}

void ADaesseuyoMvpPawn::SetCameraForBatterView() const
{
	if (!Camera)
	{
		return;
	}

	const FVector CameraLocation(-930.0f, -150.0f, 315.0f);
	const FVector LookAt(760.0f, 0.0f, 128.0f);
	Camera->SetWorldLocation(CameraLocation);
	Camera->SetWorldRotation((LookAt - CameraLocation).Rotation());
	Camera->SetFieldOfView(56.0f);
}

void ADaesseuyoMvpPawn::UpdateCameraForPhase() const
{
	if (!Camera)
	{
		return;
	}

	if (Phase != EMvpPlayPhase::BattedBall)
	{
		SetCameraForBatterView();
		return;
	}

	const FVector ClampedBall(
		FMath::Clamp(BallPosition.X, 200.0f, 5200.0f),
		FMath::Clamp(BallPosition.Y, -900.0f, 900.0f),
		FMath::Clamp(BallPosition.Z, 60.0f, 780.0f)
	);
	const FVector CameraLocation(
		FMath::Clamp(ClampedBall.X - 1180.0f, -900.0f, 3200.0f),
		FMath::Clamp(ClampedBall.Y - 260.0f, -920.0f, 420.0f),
		FMath::Clamp(ClampedBall.Z + 310.0f, 250.0f, 900.0f)
	);
	const FVector LookAt = ClampedBall + FVector(360.0f, 0.0f, 80.0f);
	Camera->SetWorldLocation(CameraLocation);
	Camera->SetWorldRotation((LookAt - CameraLocation).Rotation());
	Camera->SetFieldOfView(61.0f);
}
