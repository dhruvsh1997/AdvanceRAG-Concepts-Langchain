--=====================================================================
-- WOBBLE WORLD - starter scripts (copy-paste, no coding needed)
-- 3 scripts. Each one goes in a different place in Roblox Studio.
--=====================================================================


--=====================================================================
-- SCRIPT 1: type = Script (normal Script, NOT Local)
-- Put it in: ServerScriptService   (name it "GameServer")
--=====================================================================
local Players = game:GetService("Players")
local RS = game:GetService("ReplicatedStorage")
local TeleportService = game:GetService("TeleportService")

local function makeEvent(name)
	local e = Instance.new("RemoteEvent")
	e.Name = name
	e.Parent = RS
	return e
end

local GrabEvent = makeEvent("GrabEvent")
local RagdollEvent = makeEvent("RagdollEvent")
local SoloEvent = makeEvent("SoloEvent")

local grabs = {} -- grabs[player][side] = weld

local function getHand(char, side)
	return char:FindFirstChild(side .. "Hand") or char:FindFirstChild(side .. " Arm")
end

local function release(player, side)
	local t = grabs[player]
	if t and t[side] then
		t[side]:Destroy()
		t[side] = nil
	end
end

GrabEvent.OnServerEvent:Connect(function(player, side, part)
	if side ~= "Left" and side ~= "Right" then return end
	release(player, side)
	if typeof(part) ~= "Instance" or not part:IsA("BasePart") then return end
	if part.Anchored then return end

	local char = player.Character
	if not char or part:IsDescendantOf(char) then return end
	local hand = getHand(char, side)
	if not hand then return end
	if (hand.Position - part.Position).Magnitude > 12 then return end

	local weld = Instance.new("WeldConstraint")
	weld.Part0 = hand
	weld.Part1 = part
	weld.Parent = hand
	grabs[player] = grabs[player] or {}
	grabs[player][side] = weld
end)

-- Ragdoll (floppy mode) --------------------------------------------------
local function setRagdoll(char, on)
	local hum = char:FindFirstChildOfClass("Humanoid")
	if not hum then return end

	if on then
		for _, m in ipairs(char:GetDescendants()) do
			if m:IsA("Motor6D") and m.Part0 and m.Part1 and m.Name ~= "RootJoint" and m.Name ~= "Root" then
				local a0 = Instance.new("Attachment")
				a0.Name = "RagdollA0"
				a0.CFrame = m.C0
				a0.Parent = m.Part0
				local a1 = Instance.new("Attachment")
				a1.Name = "RagdollA1"
				a1.CFrame = m.C1
				a1.Parent = m.Part1
				local s = Instance.new("BallSocketConstraint")
				s.Name = "RagdollSocket"
				s.Attachment0 = a0
				s.Attachment1 = a1
				s.LimitsEnabled = true
				s.TwistLimitsEnabled = true
				s.Parent = m.Part1
				m.Enabled = false
			end
		end
		hum:ChangeState(Enum.HumanoidStateType.Physics)
	else
		for _, d in ipairs(char:GetDescendants()) do
			if d.Name == "RagdollSocket" or d.Name == "RagdollA0" or d.Name == "RagdollA1" then
				d:Destroy()
			elseif d:IsA("Motor6D") then
				d.Enabled = true
			end
		end
		hum:ChangeState(Enum.HumanoidStateType.GettingUp)
	end
	char:SetAttribute("Ragdolled", on)
end

RagdollEvent.OnServerEvent:Connect(function(player)
	local char = player.Character
	if char then
		setRagdoll(char, not char:GetAttribute("Ragdolled"))
	end
end)

-- Singleplayer = private server just for that player ----------------------
SoloEvent.OnServerEvent:Connect(function(player)
	local ok, err = pcall(function()
		local code = TeleportService:ReserveServer(game.PlaceId)
		TeleportService:TeleportToPrivateServer(game.PlaceId, code, { player })
	end)
	if not ok then
		warn("Singleplayer only works in the PUBLISHED game, not in Studio test: " .. tostring(err))
	end
end)

Players.PlayerRemoving:Connect(function(p)
	grabs[p] = nil
end)


--=====================================================================
-- SCRIPT 2: type = LocalScript
-- Put it in: StarterPlayer > StarterPlayerScripts   (name it "Controls")
-- Controls: Left click = grab with left hand, Right click = right hand
--           F = go floppy / get up
--=====================================================================
local Players = game:GetService("Players")
local RS = game:GetService("ReplicatedStorage")
local UIS = game:GetService("UserInputService")

local player = Players.LocalPlayer
local mouse = player:GetMouse()

local GrabEvent = RS:WaitForChild("GrabEvent")
local RagdollEvent = RS:WaitForChild("RagdollEvent")

local function tryGrab(side)
	local target = mouse.Target
	if target and not target.Anchored then
		GrabEvent:FireServer(side, target)
	end
end

UIS.InputBegan:Connect(function(input, gameProcessed)
	if gameProcessed then return end
	if input.UserInputType == Enum.UserInputType.MouseButton1 then
		tryGrab("Left")
	elseif input.UserInputType == Enum.UserInputType.MouseButton2 then
		tryGrab("Right")
	elseif input.KeyCode == Enum.KeyCode.F then
		RagdollEvent:FireServer()
	end
end)

UIS.InputEnded:Connect(function(input)
	if input.UserInputType == Enum.UserInputType.MouseButton1 then
		GrabEvent:FireServer("Left", nil)
	elseif input.UserInputType == Enum.UserInputType.MouseButton2 then
		GrabEvent:FireServer("Right", nil)
	end
end)


--=====================================================================
-- SCRIPT 3: type = LocalScript
-- Put it in: StarterGui   (name it "MainMenu")
-- Builds the whole menu by code. You don't draw any UI.
--=====================================================================
local Players = game:GetService("Players")
local RS = game:GetService("ReplicatedStorage")

local player = Players.LocalPlayer
local SoloEvent = RS:WaitForChild("SoloEvent")

-- Already inside a singleplayer (private) server? Skip the menu.
if game.PrivateServerId ~= "" then return end

local gui = Instance.new("ScreenGui")
gui.Name = "MainMenu"
gui.ResetOnSpawn = false
gui.IgnoreGuiInset = true
gui.Parent = player:WaitForChild("PlayerGui")

local bg = Instance.new("Frame")
bg.Size = UDim2.fromScale(1, 1)
bg.BackgroundColor3 = Color3.fromRGB(235, 235, 235)
bg.Parent = gui

local title = Instance.new("TextLabel")
title.Size = UDim2.fromScale(1, 0.25)
title.Position = UDim2.fromScale(0, 0.1)
title.BackgroundTransparency = 1
title.Text = "WOBBLE WORLD"     -- <-- change your game name here
title.Font = Enum.Font.FredokaOne
title.TextScaled = true
title.TextColor3 = Color3.fromRGB(60, 60, 60)
title.Parent = bg

local function makeButton(text, yPos, callback)
	local b = Instance.new("TextButton")
	b.Size = UDim2.fromScale(0.3, 0.1)
	b.Position = UDim2.fromScale(0.35, yPos)
	b.BackgroundColor3 = Color3.fromRGB(255, 255, 255)
	b.Text = text
	b.Font = Enum.Font.FredokaOne
	b.TextScaled = true
	b.TextColor3 = Color3.fromRGB(60, 60, 60)
	b.Parent = bg
	local c = Instance.new("UICorner")
	c.CornerRadius = UDim.new(0.3, 0)
	c.Parent = b
	b.MouseButton1Click:Connect(callback)
end

makeButton("SINGLEPLAYER", 0.45, function()
	SoloEvent:FireServer()
end)

makeButton("MULTIPLAYER", 0.6, function()
	gui:Destroy()
end)
